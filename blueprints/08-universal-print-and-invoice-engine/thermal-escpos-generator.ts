/**
 * Universal ESC/POS Thermal Receipt Byte Stream Generator
 * Compatible with Epson, Star Micronics, Citizen, Xprinter, and all 58mm/80mm USB/LAN/Bluetooth printers.
 */

export class ESCPOSReceiptBuilder {
  private buffer: number[] = [];
  private charWidth: number; // 32 for 58mm, 48 for 80mm

  constructor(paperWidthMm: 58 | 80 = 80) {
    this.charWidth = paperWidthMm === 58 ? 32 : 48;
    this.init();
  }

  // ESC @: Initialize printer
  init(): this {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  // Alignment: 0 = Left, 1 = Center, 2 = Right
  align(align: 'left' | 'center' | 'right'): this {
    const code = align === 'left' ? 0x00 : align === 'center' ? 0x01 : 0x02;
    this.buffer.push(0x1b, 0x61, code);
    return this;
  }

  // Text formatting
  bold(enable: boolean): this {
    this.buffer.push(0x1b, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  text(str: string): this {
    const bytes = Buffer.from(str, 'utf-8');
    for (const b of bytes) this.buffer.push(b);
    return this;
  }

  line(str: string = ''): this {
    this.text(str);
    this.buffer.push(0x0a); // Line feed
    return this;
  }

  // Horizontal divider line
  divider(char: string = '-'): this {
    this.line(char.repeat(this.charWidth));
    return this;
  }

  // Two-column row: e.g. "Total Amount" ... "$149.00"
  row(left: string, right: string): this {
    const spaces = Math.max(1, this.charWidth - left.length - right.length);
    this.line(left + ' '.repeat(spaces) + right);
    return this;
  }

  // Kick cash drawer (ESC p)
  kickCashDrawer(): this {
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    return this;
  }

  // Full paper cut with feed
  cut(): this {
    this.line();
    this.line();
    this.line();
    this.buffer.push(0x1d, 0x56, 0x41, 0x00); // GS V 65 0
    return this;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.buffer);
  }
}
