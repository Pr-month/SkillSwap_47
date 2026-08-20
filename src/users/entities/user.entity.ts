import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
// import {Roles} from '........'


@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({type: 'varchar', length: 32})
  name!: string

  @Column({type: 'varchar', length: 128, unique: true})
  email!: string

  @Column({type: 'varchar', length: 255})
  password!: string

  @Column({type: 'text', nullable: true})
  about!: string

  @Column({type: 'date'})
  birthdate!: string

  @Column({type: 'varchar', length: 64})
  city!: string

  @Column({type: 'varchar', length: 16})
  gender!: string

  @Column({type: 'varchar', length: 255})
  avatar!: string

  @Column({type: 'enum', enum: [/* Roles.USER, Roles.ADMIN */], default: 'user'})
  role!: string

  // @OneToMany(() => Skill, skill => skill.user) - Skill пока не создан, поэтому закомментировал
  skills!: string[]

  @Column({type: 'varchar', length: 255})
  refreshToken!: string

  // @OneToMany(() => Category, category => category.wantToLearn) - Category пока не создан, поэтому закомментировал
  wantToLearn!: string[]

  @Column({type: 'simple-array', nullable: true})
  favoriteSkills!: string[]
}
