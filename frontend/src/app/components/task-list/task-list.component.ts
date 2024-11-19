import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [TaskService],
  templateUrl: './task-list.component.html',
//   styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filters = {
    entity_name: '',
    task_type: '',
    contact_person: '',
    status: ''
  };
  sortBy = 'creation_date';
  sortOrder = 'desc';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks(this.filters, this.sortBy, this.sortOrder)
      .subscribe(tasks => this.tasks = tasks);
  }

  applyFilters() {
    this.loadTasks();
  }

  updateSort(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'desc';
    }
    this.loadTasks();
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => {
        this.loadTasks();
      });
    }
  }

  updateStatus(task: Task) {
    const newStatus: 'open' | 'closed' = task.status === 'open' ? 'closed' : 'open';
    const updatedTask = { ...task, status: newStatus };
    this.taskService.updateTask(task.id!, updatedTask).subscribe(() => {
      this.loadTasks();
    });
  }
}