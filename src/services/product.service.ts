import { Injectable } from '@nestjs/common';
import pool from '../connections/db';

@Injectable()
export class ProductsService {
  async getFilteredProducts(query: any) {
    const {
      category,
      brand,
      color,
      size,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'created_at',
      order = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const offset = (page - 1) * limit;
    const params: any[] = [];
    const whereClauses: string[] = [];
    console.log(whereClauses);
    let havingClause = '';

    if (category) {
      params.push(category);
      whereClauses.push(`c.name = $${params.length}`);
    }

    if (brand) {
      params.push(brand);
      whereClauses.push(`b.name = $${params.length}`);
    }

    if (color) {
      params.push(color);
      whereClauses.push(`co.name = $${params.length}`);
    }

    if (size) {
      params.push(size);
      whereClauses.push(`s.value = $${params.length}`);
    }

    if (minPrice) {
      params.push(minPrice);
      whereClauses.push(`p.price >= $${params.length}`);
    }

    if (maxPrice) {
      params.push(maxPrice);
      whereClauses.push(`p.price <= $${params.length}`);
    }

    if (minRating) {
      params.push(minRating);
      havingClause = `HAVING AVG(r.value) >= $${params.length}`;
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    //console.log(whereSQL);

    const queryText = `
      SELECT 
        p.*, 
        c.name AS category, 
        b.name AS brand, 
        ARRAY_AGG(DISTINCT co.name) AS colors,
        ARRAY_AGG(DISTINCT s.value) AS sizes,
        ROUND(AVG(r.value)) AS average_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
      LEFT JOIN colors co ON pc.color_id = co.id
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      LEFT JOIN sizes s ON ps.size_id = s.id
      LEFT JOIN ratings r ON p.id = r.product_id
      ${whereSQL}
      GROUP BY p.id, c.name, b.name
      ${havingClause}
      ORDER BY ${sortBy === 'rating' ? 'AVG(r.value)' : `p.${sortBy}`} ${order}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await pool.query(queryText, params);
    return result.rows;
  }
}