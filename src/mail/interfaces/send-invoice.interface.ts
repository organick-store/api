import { IInvoice } from './invoice.interface';

export interface ISendInvoice {
  readonly email: string;

  readonly invoice: IInvoice;
}
