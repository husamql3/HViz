// entities/Comment.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @ManyToOne(() => Post, post => post.comments)
  post: Post;

  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
  parent?: Comment;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];
}