import { CatalogSKU } from '../../types';
import { catalogSkusPart1 } from './catalogPart1';
import { catalogSkusPart2 } from './catalogPart2';

export const CATALOG_SKUS: CatalogSKU[] = [...catalogSkusPart1, ...catalogSkusPart2];
