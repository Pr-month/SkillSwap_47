import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { UserGender } from '../../common/enums/user-gender.enum';
import { Skill } from '../../skills/entities/skill.entity';
import { Roles } from '../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  name!: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'text', nullable: true })
  about!: string | null;

  @Column({ type: 'date' })
  birthdate!: string;

  @Column({ type: 'varchar', length: 64 })
  city!: string;

  @Column({ type: 'enum', enum: UserGender })
  gender!: UserGender;

  @Column({ type: 'varchar', length: 255, default: '' })
  avatar!: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.USER,
  })
  role!: Roles;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills!: Skill[];

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken!: string | null;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'users_want_to_learn',
    joinColumn: { name: 'usersId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoriesId', referencedColumnName: 'id' },
  })
  wantToLearn!: Category[];

  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'users_favorite_skills',
    joinColumn: { name: 'usersId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillsId', referencedColumnName: 'id' },
  })
  favoriteSkills!: Skill[];
}
