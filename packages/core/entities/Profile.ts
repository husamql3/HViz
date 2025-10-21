// entities/Profile.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'json', nullable: true })
  socialLinks?: object;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}