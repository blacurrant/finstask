import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditing = false;
  taskId?: number;  

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      entity_name: ['', Validators.required],
      task_type: ['', Validators.required],
      task_time: ['', Validators.required],
      contact_person: ['', Validators.required],
      note: [''],
      status: ['open'],
    });
  }

  ngOnInit() {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.taskId) {
      this.isEditing = true;
      this.taskService.getTasks({ id: this.taskId }).subscribe((tasks) => {
        if (tasks.length > 0) {
          const task = tasks[0];
          this.taskForm.patchValue({
            entity_name: task.entity_name,
            task_type: task.task_type,
            task_time: task.task_time,
            contact_person: task.contact_person,
            note: task.note,
            status: task.status,
          });
        }
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;

      if (this.isEditing && this.taskId) {
        this.taskService.updateTask(this.taskId, taskData).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error updating task:', error);
          },
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error creating task:', error);
          },
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }
}
