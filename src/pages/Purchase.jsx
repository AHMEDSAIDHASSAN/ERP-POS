import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { exportToinventory, getsupplierBills } from "../services/apis";
import { Printer, FileText, DollarSign, AlertCircle, Eye, FolderInput } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Purchase() {
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const { id } = useParams();
  const [printingBill, setPrintingBill] = useState(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ["supplier_bills", id],
    queryFn: () => getsupplierBills(token, id)
  });

  const bills = data?.data || [];

  const queryClient = useQueryClient()

  const handlePrint = (bill) => {
    setPrintingBill(bill);
    setTimeout(() => {
      window.print();
      setPrintingBill(null);
    }, 100);
  };


  const {mutate} = useMutation({
    mutationKey:["export_to_inventory"],
    mutationFn:(payload)=>exportToinventory(token,payload.id),
    onSuccess:()=>{
      toast.success("inventory updated successfully"),
      queryClient.invalidateQueries({
        queryKey:["supplier_bills",id]
      })
    },
    onError:(e)=>{
      toast.error(e?.response?.data?.message)
    }
  })
  // Calculate statistics
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + (bill.paidAmount + bill.dueAmount), 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.paidAmount, 0);
  const totalDue = bills.reduce((sum, bill) => sum + bill.dueAmount, 0);

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "unpaid":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <div className="text-xl text-gray-400">Loading purchase bills...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              color: black;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
          }
          @media screen {
            .print-area {
              display: none;
            }
          }
        `}
      </style>

      <div className="min-h-screen text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 no-print">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider ml-4">
              Purchase Bills
            </h2>
          </div>

          <button
            onClick={() => navigate(`/create-purchase/${id}`)}
            className="bg-popular px-4 py-2 font-semibold rounded-lg transition-colors"
          >
            Create Purchase
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6 no-print">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Bills</p>
                <p className="text-2xl font-bold">{totalBills}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500 opacity-70" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500 opacity-70" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-400">${totalPaid.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-70" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Due</p>
                <p className="text-2xl font-bold text-red-400">${totalDue.toFixed(2)}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500 opacity-70" />
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="px-6 space-y-4 no-print">
          {bills.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No purchase bills found</p>
            </div>
          ) : (
            bills.map((bill) => {
              const totalBillAmount = bill.paidAmount + bill.dueAmount;
              const itemCount = bill.items?.length || 0;

              return (
                <div
                  key={bill._id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{bill.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(
                            bill.paymentStatus
                          )}`}
                        >
                          {bill.paymentStatus?.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Invoice Number</p>
                          <p className="text-white font-semibold">#{bill.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Items</p>
                          <p className="text-white font-semibold">{itemCount} items</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Total Amount</p>
                          <p className="text-white font-semibold">${totalBillAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Paid Amount</p>
                          <p className="text-green-400 font-semibold">${bill.paidAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      {bill.dueAmount > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">Due: ${bill.dueAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handlePrint(bill)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start lg:self-center"
                    >
                      <Printer className="w-4 h-4" />
                      Print Bill
                    </button>
                    <button
                      onClick={() => navigate(`/purchase/view/${bill._id}`)}
                      className="bg-popular text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start lg:self-center"
                    >
                      <Eye  className="w-4 h-4" />
                      View
                    </button>
                    <button
                    disabled={bill.exported}
                      onClick={() => mutate({id:bill._id})}
                      className={` ${bill.exported ? "bg-green-500/10 cursor-not-allowed" : "bg-green-500"} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start lg:self-center`}
                    >
                      <FolderInput  className="w-4 h-4" />
                      Export To Inventory
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Print Area - Only visible when printing */}
        {printingBill && (
          <div className="print-area">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
                  PURCHASE INVOICE
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>Invoice #{printingBill.invoiceNumber}</p>
              </div>

              {/* Bill Title and Info */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
                  {printingBill.title}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Payment Status</p>
                    <p style={{ fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase', color: '#000' }}>
                      {printingBill.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Number of Items</p>
                    <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#000' }}>
                      {printingBill.items?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px', color: '#000' }}>
                  Items
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                      <th style={{ textAlign: 'left', padding: '10px 5px', color: '#666', fontWeight: 'bold' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '10px 5px', color: '#666', fontWeight: 'bold' }}>Item Name</th>
                      <th style={{ textAlign: 'right', padding: '10px 5px', color: '#666', fontWeight: 'bold' }}>Quantity</th>
                      <th style={{ textAlign: 'right', padding: '10px 5px', color: '#666', fontWeight: 'bold' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '10px 5px', color: '#666', fontWeight: 'bold' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printingBill.items?.map((item, index) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px 5px', color: '#000' }}>{index + 1}</td>
                        <td style={{ padding: '12px 5px', fontWeight: '500', color: '#000' }}>
                          {item.inventoryId?.productName || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 5px', textAlign: 'right', color: '#000' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 5px', textAlign: 'right', color: '#000' }}>
                          ${item.price.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div style={{ borderTop: '2px solid #333', borderBottom: '2px solid #333', padding: '15px 0', marginBottom: '20px' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666', fontSize: '16px' }}>Subtotal:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
                        ${(printingBill.paidAmount + printingBill.dueAmount).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666', fontSize: '16px' }}>Paid Amount:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#16a34a' }}>
                        ${printingBill.paidAmount.toFixed(2)}
                      </td>
                    </tr>
                    {printingBill.dueAmount > 0 && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666', fontSize: '16px' }}>Due Amount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#dc2626' }}>
                          ${printingBill.dueAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '20px', marginTop: '30px', borderRadius: '8px' }}>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', margin: 0 }}>
                  Total: ${(printingBill.paidAmount + printingBill.dueAmount).toFixed(2)}
                </p>
              </div>

              {/* Footer */}
              <div style={{ marginTop: '40px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                <p style={{ marginBottom: '5px' }}>Thank you for your business!</p>
                <p>This is a computer-generated invoice</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}