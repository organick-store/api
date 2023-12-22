import { Injectable } from '@nestjs/common';
import { confirmationTemplate } from '../templates/confirmation.template';
import { temporaryPasswordTemplate } from '../templates/temporary-password.template'
import { invoiceTemplate } from '../templates/invoice.template';
import { IInvoiceProduct } from '../interfaces/invoice-product.interface';
import { IInvoice } from '../interfaces/invoice.interface';

@Injectable()
export class ParserService {
  public parseConfirmation(link: string): string {
    return confirmationTemplate.replace('LINK', link);
  }

  public parseTemporaryPassword(password: string): string {
    return temporaryPasswordTemplate.replace('TMP_PASSWD', password);
  }

  public parseInvoice(payload: IInvoice): string {
    let productsMessage = '';
    for (const product of payload.products) {
      productsMessage += `${product.quantity} of item ${product.name}\n`;
    }

    return invoiceTemplate
      .replace('PRODUCTS', productsMessage)
      .replace('DELIVERY_ADDRESS', payload.address);
  }
}