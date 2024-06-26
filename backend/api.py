from flask import Flask, Response, jsonify, send_file, request, render_template
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
import os
import random
import sqlite3
import json
import time

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins="*")

DATABASE_PATH = '/backend/db/games.db'

def notify_score_update():
    easy_scores = fetch_scores_from_db('easy')
    medium_scores = fetch_scores_from_db('medium')
    hard_scores = fetch_scores_from_db('hard')
    top_players = fetch_top_players_from_db()
    socketio.emit('score_update', {
        'easy': easy_scores,
        'medium': medium_scores,
        'hard': hard_scores,
        'top_players': top_players
    })

def initialize_database():
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()

    # Create tables if they don't exist
    c.execute('''CREATE TABLE IF NOT EXISTS player (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 username TEXT NOT NULL,
                 games_played INTEGER DEFAULT 0)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS ops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT UNIQUE NOT NULL,
                successful_guesses INTEGER DEFAULT 0,
                unsuccessful_guesses INTEGER DEFAULT 0)''')

    # Create tables for difficulty levels
    c.execute('''CREATE TABLE IF NOT EXISTS easy (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 player_id INTEGER UNIQUE,
                 score INTEGER NOT NULL,
                 FOREIGN KEY (player_id) REFERENCES player(id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS medium (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 player_id INTEGER UNIQUE,
                 score INTEGER NOT NULL,
                 FOREIGN KEY (player_id) REFERENCES player(id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS hard (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 player_id INTEGER UNIQUE,
                 score INTEGER NOT NULL,
                 FOREIGN KEY (player_id) REFERENCES player(id))''')
    conn.commit()
    conn.close()

# Initialize database when the server starts
initialize_database()

VIDEO_DIR = '/ftp/videos'

@app.route('/')
def hello():
    return "Welcome to the video server API!"

@app.route('/add_scores', methods=['POST'])
def add_scores():
    if request.method == 'POST':
        op_name = request.form['op_name']
        difficulty = request.form['difficulty']

        players = [
            {
                "username": request.form.get('username_1'),
                "score": 1 if request.form.get('score_1', '0') == '1' else 0
            },
            {
                "username": request.form.get('username_2'),
                "score": 1 if request.form.get('score_2', '0') == '1' else 0
            },
            {
                "username": request.form.get('username_3'),
                "score": 1 if request.form.get('score_3', '0') == '1' else 0
            }
        ]

        app.logger.info(f"Received data - Players: {players}, Difficulty: {difficulty}")

        try:
            conn = sqlite3.connect(DATABASE_PATH)
            c = conn.cursor()

            for player in players:
                playername = player["username"]
                score = player["score"]

                # Check if player exists
                c.execute("SELECT id, games_played FROM player WHERE username=?", (playername,))
                player_row = c.fetchone()
                if player_row:
                    player_id, games_played = player_row
                    games_played += 1
                    c.execute("UPDATE player SET games_played=? WHERE id=?", (games_played, player_id))
                else:
                    c.execute("INSERT INTO player (username, games_played) VALUES (?, ?)", (playername, 1))
                    player_id = c.lastrowid

                # Insert or update score into the appropriate table based on difficulty
                if difficulty == 'easy':
                    c.execute("INSERT INTO easy (player_id, score) VALUES (?, ?) ON CONFLICT(player_id) DO UPDATE SET score=score+?", (player_id, score, score))
                elif difficulty == 'medium':
                    c.execute("INSERT INTO medium (player_id, score) VALUES (?, ?) ON CONFLICT(player_id) DO UPDATE SET score=score+?", (player_id, score, score))
                elif difficulty == 'hard':
                    c.execute("INSERT INTO hard (player_id, score) VALUES (?, ?) ON CONFLICT(player_id) DO UPDATE SET score=score+?", (player_id, score, score))

                if score == 1:
                    c.execute("INSERT INTO ops (title, successful_guesses, unsuccessful_guesses) VALUES (?, 1, 0) ON CONFLICT(title) DO UPDATE SET successful_guesses=successful_guesses+1 WHERE title=?", (op_name, op_name))
                else:
                    c.execute("INSERT INTO ops (title, successful_guesses, unsuccessful_guesses) VALUES (?, 0, 1) ON CONFLICT(title) DO UPDATE SET unsuccessful_guesses=unsuccessful_guesses+1 WHERE title=?", (op_name, op_name))

            conn.commit()
            notify_score_update()
            return "Scores added successfully!"
        except sqlite3.Error as e:
            return f"Error adding scores: {e}"
        finally:
            conn.close()
    else:
        return render_template('add_scores.html')


@app.route('/autocomplete')
def autocomplete():
    username_prefix = request.args.get('username_prefix', '')
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()
        c.execute("SELECT username FROM player WHERE username LIKE ? LIMIT 10", (f'{username_prefix}%',))
        matching_usernames = [row[0] for row in c.fetchall()]
        return jsonify(matching_usernames)
    except sqlite3.Error as e:
        return f"Error fetching autocomplete: {e}"
    finally:
        conn.close()

# Helper function to fetch scores from the database
def fetch_scores_from_db(difficulty):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()
        c.execute(f"SELECT player.username, {difficulty}.score FROM {difficulty} INNER JOIN player ON {difficulty}.player_id = player.id ORDER BY {difficulty}.score DESC LIMIT 10")
        scores = [{"username": row[0], "score": row[1]} for row in c.fetchall()]
        return scores
    except sqlite3.Error as e:
        print(f"Error fetching {difficulty} scores: {e}")
        return []
    finally:
        conn.close()

# Helper function to fetch top players based on games played
def fetch_top_players_from_db():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()
        c.execute("SELECT username, games_played FROM player ORDER BY games_played DESC LIMIT 10")
        top_players = [{"username": row[0], "games_played": row[1]} for row in c.fetchall()]
        return top_players
    except sqlite3.Error as e:
        print(f"Error fetching top players: {e}")
        return []
    finally:
        conn.close()

@app.route('/events/easy-scores')
def easy_scores_events():
    easy_scores = fetch_scores_from_db('easy')  # Fetch easy scores from the database
    return jsonify(easy_scores)

@app.route('/events/medium-scores')
def medium_scores_events():
    medium_scores = fetch_scores_from_db('medium')  # Fetch medium scores from the database
    return jsonify(medium_scores)

@app.route('/events/hard-scores')
def hard_scores_events():
    hard_scores = fetch_scores_from_db('hard')  # Fetch hard scores from the database
    return jsonify(hard_scores)

@app.route('/events/top-players')
def top_players_events():
    top_players = fetch_top_players_from_db()  # Fetch top players from the database
    return jsonify(top_players)

@app.route('/videos')
def list_videos():
    videos = {}
    for category in os.listdir(VIDEO_DIR):
        videos[category] = os.listdir(os.path.join(VIDEO_DIR, category))
    return jsonify(videos)

@app.route('/videos/categories')
def list_categories():
    categories = os.listdir(VIDEO_DIR)
    return jsonify(categories)

@app.route('/videos/random/<category>')
def random_video(category):
    videos = os.listdir(os.path.join(VIDEO_DIR, category))
    if videos:
        video = random.choice(videos)
        return jsonify({"category": category, "video": video})
    else:
        return jsonify({"error": "No videos found in this category"})

@app.route('/videos/<category>/<video>')
def get_video(category, video):
    video_path = os.path.join(VIDEO_DIR, category, video)
    if os.path.exists(video_path):
        return send_file(video_path, mimetype='video/mp4')
    else:
        return jsonify({"error": "Video not found"})
    
@app.route('/op_stats/<op_name>', methods=['GET'])
def get_op_stats(op_name):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()
        c.execute("SELECT successful_guesses, unsuccessful_guesses FROM ops WHERE title=?", (op_name,))
        op_stats = c.fetchone()
        if op_stats:
            return jsonify({"successful_guesses": op_stats[0], "unsuccessful_guesses": op_stats[1]})
        else:
            return jsonify({"successful_guesses": 0, "unsuccessful_guesses": 0})
    except sqlite3.Error as e:
        return f"Error fetching op stats: {e}", 500
    finally:
        conn.close()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)