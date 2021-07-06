import { QueryParamsListDto } from '../dto/base-list.dto';
import { PagerDto } from '../dto/pager.dto';

export interface IPaginatorData<T> {
  docs: T[],
  paginator: PagerDto
}

export class Paginator<T> {

  /**
   * Initializes a new Paginator instance
   * @param {MongooseModel} data Documents of collection
   * @param {QueryParamsListDto} queryParams Parameters object model
   * @param {Number} totalDocuments Total documents of collection
   */
  constructor(
    private data: T[],
    private queryParams: QueryParamsListDto,
    private totalDocuments: number
  ) {}

  /**
   * Creates the pagination object
   * @returns Pagination object
   */
  getPaginator(): IPaginatorData<T> {
    let { page, pageSize } = this.queryParams;

    if (!page) page = 1;
    if (!pageSize) pageSize = 10;

    const take = page * pageSize;

    return {
      docs: this.data,
      paginator: {
        page: page < 1 ? 1 : page,
        pageSize: pageSize < 1 ? 10 : pageSize > 100 ? 100 : pageSize,
        remainingDocuments: (this.totalDocuments - take) <= 0 ? 0 : this.totalDocuments - take,
        totalDocuments: this.totalDocuments
      }
    };
  }

}