import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  children = signal<{ name: string }[]>([{ name: '' }]);
  adultCount = signal<number>(1);
  confirmed = signal<boolean>(false);
  submitted = signal<boolean>(false);
  error = signal<string>('');
  private readonly DEVICE_ID_KEY = 'party_registration_device_id';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    // Check for existing device ID
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    } else {
      // Check if there's an existing registration
      const hasRegistration = await this.supabaseService.checkExistingRegistration(deviceId);
      if (hasRegistration) {
        this.submitted.set(true);
      }
    }
  }

  addChild() {
    this.children.update(kids => [...kids, { name: '' }]);
  }

  removeChild(index: number) {
    if (this.children().length > 1) {
      this.children.update(kids => kids.filter((_, i) => i !== index));
    }
  }

  updateAdultCount(value: number) {
    this.adultCount.set(value);
  }

  updateConfirmed(value: boolean) {
    this.confirmed.set(value);
  }

  async onSubmit() {
    if (!this.confirmed()) {
      this.error.set('Por favor confirma tu asistencia');
      return;
    }

    try {
      const deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
      if (!deviceId) {
        throw new Error('No se encontró el ID del dispositivo');
      }

      await this.supabaseService.saveRegistration(
        this.adultCount(),
        this.children().map(child => child.name),
        deviceId
      );
      this.submitted.set(true);
      this.error.set('');
    } catch (err: any) {
      this.error.set(err.message || 'Error al guardar el registro');
      console.error(err);
    }
  }
}