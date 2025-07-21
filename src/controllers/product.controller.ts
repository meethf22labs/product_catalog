import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../services/product.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async getProducts(@Query() query: any) {
        return await this.productsService.getFilteredProducts(query);
    }
}