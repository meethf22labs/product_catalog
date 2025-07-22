import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './product.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() query: any) {
    return await this.productsService.getFilteredProducts(query);
  }
}
