import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

const RTX_4070_IMAGE = '/images/products/rtx-4070.png';
const RYZEN_7800X3D_IMAGE = '/images/products/ryzen-7800x3d.png';
const KINGSTON_FURY_BEAST_DDR5_32_IMAGE =
  '/images/products/kingston-fury-beast-ddr5-32gb.png';
const SAMSUNG_990_PRO_2TB_IMAGE = '/images/products/samsung-990-pro-2tb.png';
const LG_ULTRAGEAR_27_QHD_165_IMAGE =
  '/images/products/lg-ultragear-27-qhd-165.png';
const AMD_RADEON_RX_7800_XT_IMAGE =
  '/images/products/amd-radeon-rx-7800-xt.png';

const DEMO: Array<{
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
}> = [
  {
    name: 'NVIDIA GeForce RTX 4070',
    description: 'Игровая видеокарта с трассировкой лучей, 12 ГБ GDDR6X.',
    price: 289_990,
    stock: 12,
    category: 'GPU',
    imageUrl: RTX_4070_IMAGE,
  },
  {
    name: 'AMD Ryzen 7 7800X3D',
    description: 'Процессор для игр с 3D V-Cache, AM5, 8 ядер.',
    price: 199_500,
    stock: 7,
    category: 'CPU',
    imageUrl: RYZEN_7800X3D_IMAGE,
  },
  {
    name: 'Kingston FURY Beast DDR5 32 ГБ',
    description: 'Комплект 2×16 ГБ, 6000 МТ/с, низкие тайминги.',
    price: 54_990,
    stock: 25,
    category: 'RAM',
    imageUrl: KINGSTON_FURY_BEAST_DDR5_32_IMAGE,
  },
  {
    name: 'Samsung 990 PRO 2 ТБ',
    description: 'NVMe SSD PCIe 4.0, до 7450 МБ/с чтение.',
    price: 89_000,
    stock: 18,
    category: 'SSD',
    imageUrl: SAMSUNG_990_PRO_2TB_IMAGE,
  },
  {
    name: 'LG UltraGear 27" QHD 165 Гц',
    description: 'IPS, 1 мс, HDR10, подставка с регулировкой.',
    price: 142_000,
    stock: 4,
    category: 'Monitor',
    imageUrl: LG_ULTRAGEAR_27_QHD_165_IMAGE,
  },
  {
    name: 'AMD Radeon RX 7800 XT',
    description: '16 ГБ GDDR6, отличный выбор для 1440p.',
    price: 219_000,
    stock: 3,
    category: 'GPU',
    imageUrl: AMD_RADEON_RX_7800_XT_IMAGE,
  },
];

@Injectable()
export class ProductSeedService implements OnModuleInit {
  private readonly logger = new Logger(ProductSeedService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const useSqlite = this.config.get<string>('DATABASE_USE_SQLITE') === 'true';

    if (useSqlite) {
      const count = await this.productRepository.count();
      if (count === 0) {
        await this.productRepository.save(DEMO);
        this.logger.log('Загружены демо-товары (режим SQLite).');
      }
    }

    const rtx = await this.productRepository.findOne({
      where: { name: 'NVIDIA GeForce RTX 4070' },
    });
    if (rtx && rtx.imageUrl !== RTX_4070_IMAGE) {
      rtx.imageUrl = RTX_4070_IMAGE;
      await this.productRepository.save(rtx);
      this.logger.log('Обновлено изображение для NVIDIA GeForce RTX 4070.');
    }

    const ryzen = await this.productRepository.findOne({
      where: { name: 'AMD Ryzen 7 7800X3D' },
    });
    if (ryzen && ryzen.imageUrl !== RYZEN_7800X3D_IMAGE) {
      ryzen.imageUrl = RYZEN_7800X3D_IMAGE;
      await this.productRepository.save(ryzen);
      this.logger.log('Обновлено изображение для AMD Ryzen 7 7800X3D.');
    }

    const kingston = await this.productRepository.findOne({
      where: { name: 'Kingston FURY Beast DDR5 32 ГБ' },
    });
    if (
      kingston &&
      kingston.imageUrl !== KINGSTON_FURY_BEAST_DDR5_32_IMAGE
    ) {
      kingston.imageUrl = KINGSTON_FURY_BEAST_DDR5_32_IMAGE;
      await this.productRepository.save(kingston);
      this.logger.log(
        'Обновлено изображение для Kingston FURY Beast DDR5 32 ГБ.',
      );
    }

    const samsung = await this.productRepository.findOne({
      where: { name: 'Samsung 990 PRO 2 ТБ' },
    });
    if (samsung && samsung.imageUrl !== SAMSUNG_990_PRO_2TB_IMAGE) {
      samsung.imageUrl = SAMSUNG_990_PRO_2TB_IMAGE;
      await this.productRepository.save(samsung);
      this.logger.log('Обновлено изображение для Samsung 990 PRO 2 ТБ.');
    }

    const lg = await this.productRepository.findOne({
      where: { name: 'LG UltraGear 27" QHD 165 Гц' },
    });
    if (lg && lg.imageUrl !== LG_ULTRAGEAR_27_QHD_165_IMAGE) {
      lg.imageUrl = LG_ULTRAGEAR_27_QHD_165_IMAGE;
      await this.productRepository.save(lg);
      this.logger.log(
        'Обновлено изображение для LG UltraGear 27" QHD 165 Гц.',
      );
    }

    const rx7800 = await this.productRepository.findOne({
      where: { name: 'AMD Radeon RX 7800 XT' },
    });
    if (rx7800 && rx7800.imageUrl !== AMD_RADEON_RX_7800_XT_IMAGE) {
      rx7800.imageUrl = AMD_RADEON_RX_7800_XT_IMAGE;
      await this.productRepository.save(rx7800);
      this.logger.log('Обновлено изображение для AMD Radeon RX 7800 XT.');
    }
  }
}
