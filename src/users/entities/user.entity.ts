import { ActiveInterface } from '@/commons/interfaces/active.interface';
import { Media } from '@/media/entities/media.entity';
import { UserRole } from '@/roles/entities/user-role.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User implements ActiveInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;
  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  activeStatus: boolean;
  isActive(): boolean {
    return this.activeStatus;
  }
  @Exclude()
  @Column({ nullable: true })
  avatarId: number;

  @OneToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'avatarId' })
  avatar: Media;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
