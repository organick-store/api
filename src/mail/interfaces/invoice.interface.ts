import { IInvoiceProduct } from './invoice-product.interface';

export interface IInvoice {
  readonly products: IInvoiceProduct[];

  readonly address: string;
}