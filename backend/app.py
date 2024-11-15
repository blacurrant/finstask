# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import datetime
from enum import Enum

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class TaskStatus(Enum):
    OPEN = "open"
    CLOSED = "closed"

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    entity_name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    task_time = db.Column(db.DateTime, nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    note = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default=TaskStatus.OPEN.value)

    def to_dict(self):
        return {
            'id': self.id,
            'creation_date': self.creation_date.isoformat(),
            'entity_name': self.entity_name,
            'task_type': self.task_type,
            'task_time': self.task_time.isoformat(),
            'contact_person': self.contact_person,
            'note': self.note,
            'status': self.status
        }

# Create all tables
with app.app_context():
    db.create_all()

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    filters = {}
    if request.args.get('entity_name'):
        filters['entity_name'] = request.args.get('entity_name')
    if request.args.get('task_type'):
        filters['task_type'] = request.args.get('task_type')
    if request.args.get('contact_person'):
        filters['contact_person'] = request.args.get('contact_person')
    if request.args.get('status'):
        filters['status'] = request.args.get('status')
    
    # Apply filters
    query = Task.query.filter_by(**filters)
    
    # Handle sorting
    sort_by = request.args.get('sort_by', 'creation_date')
    sort_order = request.args.get('sort_order', 'desc')
    
    if sort_order == 'desc':
        query = query.order_by(getattr(Task, sort_by).desc())
    else:
        query = query.order_by(getattr(Task, sort_by).asc())
    
    tasks = query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    task = Task(
        entity_name=data['entity_name'],
        task_type=data['task_type'],
        task_time=datetime.fromisoformat(data['task_time']),
        contact_person=data['contact_person'],
        note=data.get('note', ''),
        status=TaskStatus.OPEN.value
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    task.entity_name = data.get('entity_name', task.entity_name)
    task.task_type = data.get('task_type', task.task_type)
    task.task_time = datetime.fromisoformat(data['task_time']) if 'task_time' in data else task.task_time
    task.contact_person = data.get('contact_person', task.contact_person)
    task.note = data.get('note', task.note)
    task.status = data.get('status', task.status)
    
    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)