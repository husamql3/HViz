// entities/Tag.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ default: 0 })
  usageCount: number;

  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
}