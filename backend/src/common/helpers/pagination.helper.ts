import { Repository, FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult } from '../dto/pagination.dto';

export { PaginatedResult };

export async function paginate<T>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 20,
  where?: FindOptionsWhere<T>,
  relations?: string[],
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit;

  // Check if it's a QueryBuilder
  if (repositoryOrQueryBuilder instanceof SelectQueryBuilder) {
    const queryBuilder = repositoryOrQueryBuilder;
    
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Otherwise it's a Repository
  const repository = repositoryOrQueryBuilder as Repository<T>;
  
  const [data, total] = await repository.findAndCount({
    where,
    relations,
    skip,
    take: limit,
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
