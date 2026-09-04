import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequestStatus } from '../../common/enums/request-status.enum';
import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver!: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'offeredSkillId' })
  offeredSkill!: Skill;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requestedSkillId' })
  requestedSkill!: Skill;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;
}
