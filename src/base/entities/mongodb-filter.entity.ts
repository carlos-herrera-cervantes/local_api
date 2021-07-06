import { QueryParamsListDto } from '../dto/base-list.dto';

export interface IMongoDBFilter {
  sort: any,
  page: number,
  pageSize: number,
  criteria: any,
  relation: string[]
}

export class MongoDBFilter {

  protected sort: any;

  protected page: number;

  protected pageSize: number;

  protected criteria: any;

  protected relation: string[];

  constructor(private readonly queryParams: QueryParamsListDto) {}

  /**
   * Sets the properties to apply the sort
   * @returns Filter instance
   */
  setSort(): MongoDBFilter {
    const sortIsNotIncluded = !('sort' in this.queryParams);
    
    if (sortIsNotIncluded) {
      this.sort = {};
      return this;
    }
    
    this.sort = JSON.parse(this.queryParams.sort);
    return this;
  }

  /**
   * Sets the page and page size properties to the Filter instance
   * @returns Filter instance
   */
   setPagination(): MongoDBFilter {
     const pagesIsNotIncluded = !('page' in this.queryParams) && !('pageSize' in this.queryParams);
    
    if (pagesIsNotIncluded) {
      this.page = 0;
      this.pageSize = 10;
      return this;
    }

    const { page, pageSize } = this.queryParams;
    const offset = page <= 1 ? 0 : page - 1;

    this.page = offset * pageSize;
    this.pageSize = pageSize > 100 ? 100 : pageSize;
    return this;
  }

  /**
   * Sets the fields to apply the filter
   * @returns Filter instance
   */
   setCriteria(): MongoDBFilter {
    const sortIsNotIncluded = Object.entries(this.queryParams).length == 0;

    if (sortIsNotIncluded) {
      this.criteria = {};
      return this;
    }

    this.criteria = JSON.parse(this.queryParams.filter);
    return this;
  }

  /**
   * Sets the references to other collections
   * @returns Filter instance
   */
   setRelation(): MongoDBFilter {
     const relationIsIncluded = 'relation' in this.queryParams;

    if (relationIsIncluded) {
      this.relation = this.queryParams?.relation?.split(',');
      return this;
    }

    this.relation = [];
    return this;
  }

  /**
   * Returns an filter object for mongoose
   * @returns Filter object
   */
   build(): IMongoDBFilter {
    return {
      criteria: this.criteria,
      page: this.page,
      pageSize: this.pageSize,
      sort: this.sort,
      relation: this.relation
    };
  }

}