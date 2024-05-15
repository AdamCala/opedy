from flask import Flask, jsonify, send_file
from flask_cors import CORS
import os
import random

app = Flask(__name__)
CORS(app)

VIDEO_DIR = '/ftp/videos'

@app.route('/')
def hello():
    return "Welcome to the video server API!"

@app.route('/videos')
def list_videos():
    videos = {}
    for category in os.listdir(VIDEO_DIR):
        videos[category] = os.listdir(os.path.join(VIDEO_DIR, category))
    return jsonify(videos)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)