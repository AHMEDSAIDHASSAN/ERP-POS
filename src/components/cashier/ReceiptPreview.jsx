import { useRef } from "react";
import { Printer, X } from "lucide-react";

export default function ReceiptPreview({ receipt, onClose }) {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.receipt_number}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
              margin: 0 auto;
              padding: 10px;
              background: white;
              color: black;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .receipt-header h1 {
              font-size: 16px;
              margin: 0 0 5px 0;
            }
            .receipt-header p {
              margin: 2px 0;
              font-size: 11px;
            }
            .receipt-info {
              margin-bottom: 10px;
              font-size: 11px;
            }
            .receipt-info div {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .item-name {
              flex: 1;
            }
            .item-price {
              text-align: right;
              min-width: 60px;
            }
            .total-section {
              border-top: 2px solid #000;
              margin-top: 10px;
              padding-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total-row.grand-total {
              font-size: 16px;
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .payment-info {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!receipt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Receipt Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div ref={receiptRef} className="font-mono text-sm text-black">
            {/* Header */}
            <div className="receipt-header text-center border-b border-dashed border-gray-400 pb-3 mb-3">
              <h1 className="text-lg font-bold">{receipt.restaurant_name || "PATRIA COFFEE BEANS"}</h1>
              <p className="text-xs">Restaurant & Cafe</p>
              {receipt.restaurant_address && <p className="text-xs">{receipt.restaurant_address}</p>}
            </div>

            {/* Receipt Info */}
            <div className="text-xs space-y-1 mb-3">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span>{receipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(receipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{receipt.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Register:</span>
                <span>{receipt.register_name}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-3"></div>

            {/* Order Info */}
            <div className="text-xs space-y-1 mb-3">
              {receipt.table_name && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span>{receipt.table_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Order #:</span>
                <span>{receipt.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{receipt.order_type}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-3"></div>

            {/* Items */}
            <div className="mb-3">
              <div className="flex justify-between font-bold text-xs mb-2">
                <span>ITEMS</span>
                <span>AMOUNT</span>
              </div>
              {receipt.items?.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex justify-between">
                    <span className="flex-1">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="text-right min-w-[60px]">
                      {item.subtotal?.toFixed(2)} EG
                    </span>
                  </div>
                  {item.extras?.length > 0 && (
                    <div className="text-xs text-gray-600 ml-4">
                      {item.extras.map((extra, eIdx) => (
                        <div key={eIdx} className="flex justify-between">
                          <span>+ {extra.name}</span>
                          <span>{extra.price?.toFixed(2)} EG</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-black pt-2">
              <div className="flex justify-between font-bold text-base mb-1">
                <span>TOTAL:</span>
                <span>{receipt.total?.toFixed(2)} EG</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-dashed border-gray-400 my-3 pt-3">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="uppercase">{receipt.payment_method}</span>
                </div>
                {receipt.payment_method === "cash" && (
                  <>
                    <div className="flex justify-between">
                      <span>Received:</span>
                      <span>{receipt.cash_received?.toFixed(2)} EG</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change:</span>
                      <span>{receipt.change?.toFixed(2)} EG</span>
                    </div>
                  </>
                )}
                {receipt.payment_method === "visa" && receipt.visa_last_four && (
                  <div className="flex justify-between">
                    <span>Card:</span>
                    <span>****{receipt.visa_last_four}</span>
                  </div>
                )}
                {receipt.payment_method === "hybrid" && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash:</span>
                      <span>{receipt.cash_amount?.toFixed(2)} EG</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Card:</span>
                      <span>{receipt.visa_amount?.toFixed(2)} EG</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-dashed border-gray-400 mt-4 pt-4">
              <p className="text-sm font-medium">Thank you for visiting!</p>
              <p className="text-xs text-gray-600">We hope to see you again</p>
            </div>

            {/* Transaction Type for Refunds */}
            {receipt.transaction_type === "refund" && (
              <div className="mt-4 p-2 border-2 border-black text-center">
                <p className="font-bold text-lg">** REFUND **</p>
                {receipt.refund_reason && (
                  <p className="text-xs mt-1">Reason: {receipt.refund_reason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
