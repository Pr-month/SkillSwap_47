export class CategoryTreeChildDto {
  id!: string;
  name!: string;
}

export class CategoryTreeDto {
  id!: string;
  name!: string;
  children!: CategoryTreeChildDto[];
}
