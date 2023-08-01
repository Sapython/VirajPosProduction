import { Timestamp } from 'firebase-admin/firestore';
import { AnalyticsData } from '.';

export async function generateAnalytics(firestore: any, businessDoc: any) {
  // /business/uqd9dm0its2v9xx6fey2q/analyticsData/2023/7
  let prevAnalyticsData = await firestore.collection(
    `business/${businessDoc.id}/analyticsData/${new Date().getFullYear()}/${new Date().getMonth()+1}`,
  ).get();
  // console.log("prevAnalyticsData",prevAnalyticsData.docs.length);
  let averageHourlySales: {
    all: number[];
    dineIn: number[];
    takeaway: number[];
    online: number[];
  } = {
    all: [],
    dineIn: [],
    takeaway: [],
    online: [],
  };
  if (prevAnalyticsData.docs.length == 0) {
    for (let i = 0; i++; i < 24) {
      averageHourlySales.all.push(0);
      averageHourlySales.dineIn.push(0);
      averageHourlySales.takeaway.push(0);
      averageHourlySales.online.push(0);
    }
  } else {
    let salesData: {
      all: number[][];
      dineIn: number[][];
      takeaway: number[][];
      online: number[][];
    } = {
      all: [],
      dineIn: [],
      takeaway: [],
      online: [],
    };
    prevAnalyticsData.docs.forEach((doc: any) => {
      let data = doc.data();
      salesData.all.push(data.salesChannels.all.hourlySales);
      salesData.dineIn.push(data.salesChannels.dineIn.hourlySales);
      salesData.takeaway.push(data.salesChannels.takeaway.hourlySales);
      salesData.online.push(data.salesChannels.online.hourlySales);
      // console.log("Added prev analytics",salesData);
    });
    for (let i = 0; i < 24; i++) {
      // console.log("Ran ",i);
      let total = 0;
      salesData.all.forEach((hourlySales) => {
        total += hourlySales[i];
      });
      averageHourlySales.all.push(total / salesData.all.length);
      total = 0;
      salesData.dineIn.forEach((hourlySales) => {
        total += hourlySales[i];
      });
      averageHourlySales.dineIn.push(total / salesData.dineIn.length);
      total = 0;
      salesData.takeaway.forEach((hourlySales) => {
        total += hourlySales[i];
      });
      averageHourlySales.takeaway.push(total / salesData.takeaway.length);
      total = 0;
      salesData.online.forEach((hourlySales) => {
        total += hourlySales[i];
      });
      averageHourlySales.online.push(total / salesData.online.length);
    }
    // console.log("Final sales data",salesData,);
  }
  // console.log("Added prev analytics",averageHourlySales);
  let bills = firestore
    .collection(`business/${businessDoc.id}/bills`)
    .where(
      'createdDate',
      '>=',
      Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    )
    .where('createdDate', '<=', Timestamp.fromDate(new Date(Date.now())));
  let billsDocs = await bills.get();

  let analyticsData: AnalyticsData = {
    createdAt: Timestamp.fromDate(new Date()),
    createdAtUTC:(new Date()).toUTCString(),
    salesChannels: {
      all: {
        totalSales: 0,
        netSales: 0,
        totalDiscount: 0,
        totalNC: 0,
        totalTaxes: 0,
        totalSettledBills: 0,
        totalDiscountedBills:0,
        totalNcBills:0,
        totalUnsettledBills: 0,
        hourlySales: [...new Array(24).fill(0)],
        averageHourlySales: averageHourlySales.all,
        paymentReceived: {},
        billWiseSales: {
          rangeWise:{
            lowRange: {
              bills: [],
              totalSales: 0,
            },
            mediumRange: {
              bills: [],
              totalSales: 0,
            },
            highRange: {
              bills: [],
              totalSales: 0,
            },
          },
          tableWise:[],
          time:[]
        },
        itemWiseSales: {
          byPrice: [],
          byQuantity: [],
          byPriceMax:0,
          byQuantityMax:0
        },
        suspiciousActivities: [],
        userWiseActions: [
          {
            userId: '',
            userRef: null,
            actions: {
              bills: [],
              kots: [],
              discounts: [],
              settlements: [],
              ncs: [],
            },
          },
        ],
      },
      dineIn: {
        totalSales: 0,
        netSales: 0,
        totalDiscount: 0,
        totalNC: 0,
        totalTaxes: 0,
        totalSettledBills: 0,
        totalDiscountedBills:0,
        totalNcBills:0,
        totalUnsettledBills: 0,
        hourlySales: [],
        averageHourlySales: averageHourlySales.dineIn,
        paymentReceived: {},
        billWiseSales: {
          rangeWise:{
            lowRange: {
              bills: [],
              totalSales: 0,
            },
            mediumRange: {
              bills: [],
              totalSales: 0,
            },
            highRange: {
              bills: [],
              totalSales: 0,
            },
          },
          tableWise:[],
          time:[]
        },
        itemWiseSales: {
          byPrice: [],
          byQuantity: [],
          byPriceMax:0,
          byQuantityMax:0
        },
        suspiciousActivities: [],
        userWiseActions: [
          {
            userId: '',
            userRef: null,
            actions: {
              bills: [],
              kots: [],
              discounts: [],
              settlements: [],
              ncs: [],
            },
          },
        ],
      },
      takeaway: {
        totalSales: 0,
        netSales: 0,
        totalDiscount: 0,
        totalNC: 0,
        totalTaxes: 0,
        totalSettledBills: 0,
        totalDiscountedBills:0,
        totalNcBills:0,
        totalUnsettledBills: 0,
        hourlySales: [],
        averageHourlySales: averageHourlySales.takeaway,
        paymentReceived: {},
        billWiseSales: {
          rangeWise:{
            lowRange: {
              bills: [],
              totalSales: 0,
            },
            mediumRange: {
              bills: [],
              totalSales: 0,
            },
            highRange: {
              bills: [],
              totalSales: 0,
            },
          },
          tableWise:[],
          time:[]
        },
        itemWiseSales: {
          byPrice: [],
          byQuantity: [],
          byPriceMax:0,
          byQuantityMax:0
        },
        suspiciousActivities: [],
        userWiseActions: [
          {
            userId: '',
            userRef: null,
            actions: {
              bills: [],
              kots: [],
              discounts: [],
              settlements: [],
              ncs: [],
            },
          },
        ],
      },
      online: {
        totalSales: 0,
        netSales: 0,
        totalDiscount: 0,
        totalNC: 0,
        totalTaxes: 0,
        totalSettledBills: 0,
        totalDiscountedBills:0,
        totalNcBills:0,
        totalUnsettledBills: 0,
        hourlySales: [],
        averageHourlySales: averageHourlySales.online,
        paymentReceived: {},
        billWiseSales: {
          rangeWise:{
            lowRange: {
              bills: [],
              totalSales: 0,
            },
            mediumRange: {
              bills: [],
              totalSales: 0,
            },
            highRange: {
              bills: [],
              totalSales: 0,
            },
          },
          tableWise:[],
          time:[]
        },
        itemWiseSales: {
          byPrice: [],
          byQuantity: [],
          byPriceMax:0,
          byQuantityMax:0
        },
        suspiciousActivities: [],
        userWiseActions: [
          {
            userId: '',
            userRef: null,
            actions: {
              bills: [],
              kots: [],
              discounts: [],
              settlements: [],
              ncs: [],
            },
          },
        ],
      },
    },
    customersData: {
      totalCustomers: 0,
      totalCustomersByChannel: {
        dineIn: 0,
        takeaway: 0,
        online: 0,
      },
      totalNewCustomers: 0,
      totalNewCustomersByChannel: {
        dineIn: 0,
        takeaway: 0,
        online: 0,
      },
      newCustomers: [],
      allCustomers: [],
    },
  };
  analyticsData.salesChannels.all.hourlySales = new Array(24).fill(0);
  analyticsData.salesChannels.online.hourlySales = new Array(24).fill(0);
  analyticsData.salesChannels.takeaway.hourlySales = new Array(24).fill(0);
  analyticsData.salesChannels.dineIn.hourlySales = new Array(24).fill(0);
  await Promise.all(
    billsDocs.docs.map(async (billDoc: any) => {
      //   let data:BillConstructor = billDoc.data() as any;
      let data = billDoc.data() as any;
      // console.log("BILL DATA:",data);
      // business/businessId/bills/billId/activities
      let activities = firestore.collection(
        `business/${businessDoc.id}/bills/${billDoc.id}/billActivities`,
      );
      let activitiesDocs = await activities.get();
      console.log("activitiesDocs.length",activitiesDocs.docs.length);
      analyticsData.salesChannels.all.totalSales += data.billing.grandTotal;
      // console.log('BILL Total:', data.billing.grandTotal);
      if (data?.settlement?.stage == 'settled'){
        analyticsData.salesChannels.all.totalSettledBills += 1;
      } else {
        analyticsData.salesChannels.all.totalUnsettledBills += 1;
      }
      if (data?.billing?.discount?.length > 0){
        analyticsData.salesChannels.all.totalDiscountedBills += 1;
      }
      if (data?.nonChargeableDetail){
        analyticsData.salesChannels.all.totalNcBills += 1;
      }
      if (data?.billing?.discount?.length > 0){
        analyticsData.salesChannels.all.totalDiscountedBills += 1;
      }
      if (data?.nonChargeableDetail){
        analyticsData.salesChannels.all.totalNcBills += 1;
      }
      analyticsData.salesChannels.all.netSales +=
        data.billing.grandTotal -
        data.billing.discount.reduce(
          (total: number, d: any) => d.totalAppliedDiscount + total,
          0,
        );
      analyticsData.salesChannels.all.totalDiscount +=
        data.billing.discount.reduce(
          (total: number, d: any) => d.totalAppliedDiscount + total,
          0,
        );
      if (data.nonChargeableDetail) {
        analyticsData.salesChannels.all.totalNC += data.billing.grandTotal;
      }
      analyticsData.salesChannels.all.totalTaxes += data.billing.taxes.reduce(
        (total: number, t: any) => t.amount + total,
        0,
      );
      analyticsData.salesChannels.all.hourlySales[
        data.createdDate.toDate().getHours()
      ] += data.billing.grandTotal;
      analyticsData.salesChannels.all.billWiseSales.rangeWise[
        data.billing.grandTotal < 500
          ? 'lowRange'
          : data.billing.grandTotal < 1000
          ? 'mediumRange'
          : 'highRange'
      ].bills.push({
        billId: billDoc.id,
        billRef: billDoc.ref,
        time: data.createdDate,
        totalSales: data.billing.grandTotal,
      });
      // payment methods
      if (data.settlement?.payments) {
        data.settlement?.payments.forEach((payment: any) => {
          if (!analyticsData.salesChannels.all.paymentReceived[payment.paymentMethod]){
            analyticsData.salesChannels.all.paymentReceived[payment.paymentMethod] = 0;
          }
          analyticsData.salesChannels.all.paymentReceived[payment.paymentMethod] += payment.amount;
        })
      }
      // analyticsData.salesChannels.all.billWiseSales.tableWise
      // find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
      let tableIndex = analyticsData.salesChannels.all.billWiseSales.tableWise.findIndex(
        (t) => t.table === data.table,
      );
      if (tableIndex === -1) {
        analyticsData.salesChannels.all.billWiseSales.tableWise.push({
          table: data.table,
          bills: [
            {
              billId: billDoc.id,
              billRef: billDoc.ref,
              time: data.createdDate,
              totalSales: data.billing.grandTotal,
            },
          ],
          totalSales: data.billing.grandTotal,
          totalBills: 1,
        });
      } else {
        analyticsData.salesChannels.all.billWiseSales.tableWise[
          tableIndex
        ].bills.push({
          billId: billDoc.id,
          billRef: billDoc.ref,
          time: data.createdDate,
          totalSales: data.billing.grandTotal,
        });
        analyticsData.salesChannels.all.billWiseSales.tableWise[
          tableIndex
        ].totalSales += data.billing.grandTotal;
        analyticsData.salesChannels.all.billWiseSales.tableWise[
          tableIndex
        ].totalBills += 1;
      }
      // analyticsData.salesChannels.all.billWiseSales.time
      // find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
      let timeIndex = analyticsData.salesChannels.all.billWiseSales.time.findIndex(
        (t) => t.time === data.createdDate.toDate().getHours(),
      );
      if (timeIndex === -1) {
        analyticsData.salesChannels.all.billWiseSales.time.push({
          time: data.createdDate.toDate().getHours(),
          bills: [
            {
              billId: billDoc.id,
              billRef: billDoc.ref,
              time: data.createdDate,
              totalSales: data.billing.grandTotal,
            }
          ],
          totalSales: data.billing.grandTotal,
          totalBills: 1,
        });
      } else {
        analyticsData.salesChannels.all.billWiseSales.time[
          timeIndex
        ].bills.push({
          billId: billDoc.id,
          billRef: billDoc.ref,
          time: data.createdDate,
          totalSales: data.billing.grandTotal,
        });
        analyticsData.salesChannels.all.billWiseSales.time[
          timeIndex
        ].totalSales += data.billing.grandTotal;
        analyticsData.salesChannels.all.billWiseSales.time[
          timeIndex
        ].totalBills += 1;
      }
      let items = data.kots
        .map((kot: any) => {
          return kot.products.map((product: any) => {
            return product;
          });
        })
        .flat();
      items.forEach((item: any) => {
        let itemIndex =
          analyticsData.salesChannels.all.itemWiseSales.byPrice.findIndex(
            (i) => i.id === item.id,
          );
        if (itemIndex === -1) {
          analyticsData.salesChannels.all.itemWiseSales.byPrice.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category,
            id: item.id || '',
          });
          analyticsData.salesChannels.all.itemWiseSales.byQuantity.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category,
            id: item.id || '',
          });
        } else {
          analyticsData.salesChannels.all.itemWiseSales.byPrice[
            itemIndex
          ].quantity += item.quantity;
          analyticsData.salesChannels.all.itemWiseSales.byPrice[
            itemIndex
          ].price += item.quantity * item.price;
          analyticsData.salesChannels.all.itemWiseSales.byQuantity[
            itemIndex
          ].quantity += item.quantity;
          analyticsData.salesChannels.all.itemWiseSales.byQuantity[
            itemIndex
          ].quantity += item.quantity * item.price;
        }
        if (data.mode == 'dineIn') {
          let itemIndex =
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.findIndex(
              (i) => i.id === item.id,
            );
          if (itemIndex === -1) {
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.push({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              id: item.id || '',
            });
            analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity.push({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              id: item.id || '',
            });
          } else {
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[
              itemIndex
            ].quantity += item.quantity;
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[
              itemIndex
            ].price += item.quantity * item.price;
            analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[
              itemIndex
            ].quantity += item.quantity;
            analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[
              itemIndex
            ].quantity += item.quantity * item.price;
          }
        } else if (data.mode == 'takeaway') {
          let itemIndex =
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.findIndex(
              (i) => i.id === item.id,
            );
          if (itemIndex === -1) {
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.push({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              id: item.id || '',
            });
            analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity.push({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              id: item.id || '',
            });
          } else {
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[
              itemIndex
            ].quantity += item.quantity;
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[
              itemIndex
            ].price += item.quantity * item.price;
            analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[
              itemIndex
            ].quantity += item.quantity;
            analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[
              itemIndex
            ].quantity += item.quantity * item.price;
          }
        } else if (data.mode == 'online') {
          let itemIndex =
            analyticsData.salesChannels.online.itemWiseSales.byPrice.findIndex(
              (i) => i.id === item.id,
            );
          if (itemIndex === -1) {
            analyticsData.salesChannels.online.itemWiseSales.byPrice.push({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              id: item.id || '',
            });
            analyticsData.salesChannels.online.itemWiseSales.byQuantity.push({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              id: item.id || '',
            });
          } else {
            analyticsData.salesChannels.online.itemWiseSales.byPrice[
              itemIndex
            ].quantity += item.quantity;
            analyticsData.salesChannels.online.itemWiseSales.byPrice[
              itemIndex
            ].price += item.quantity * item.price;
            analyticsData.salesChannels.online.itemWiseSales.byQuantity[
              itemIndex
            ].quantity += item.quantity;
            analyticsData.salesChannels.online.itemWiseSales.byQuantity[
              itemIndex
            ].quantity += item.quantity * item.price;
          }
        }
      });
      // sort itemWiseSales by price
      analyticsData.salesChannels.all.itemWiseSales.byPrice.sort(
        (a, b) => b.price - a.price,
      );
      // sort itemWiseSales by quantity
      analyticsData.salesChannels.all.itemWiseSales.byQuantity.sort(
        (a, b) => b.quantity - a.quantity,
      );
      // suspicious activities
      let activitiesList:{
        createdDate: Timestamp;
        activity: {
          type:
            | 'newKot'
            | 'kotPrinted'
            | 'kotEdited'
            | 'kotCancelled'
            | 'billPrinted'
            | 'billEdited'
            | 'billCancelled'
            | 'billSettled'
            | 'billSplit'
            | 'billDiscounted'
            | 'billNC'
            | 'customerDetailEntered'
            | 'billNormal'
            | 'billFinalized'
            | 'instructionSet'
            | 'lineCancelled'
            | 'lineDiscounted';
          message: string;
          user: string;
          data?: any;
        };
      }[] = activitiesDocs.docs.map(
        (doc: any) =>
          doc.data() as {
            createdDate: Timestamp;
            activity: {
              type:
                | 'newKot'
                | 'kotPrinted'
                | 'kotEdited'
                | 'kotCancelled'
                | 'billPrinted'
                | 'billEdited'
                | 'billCancelled'
                | 'billSettled'
                | 'billSplit'
                | 'billDiscounted'
                | 'billNC'
                | 'customerDetailEntered'
                | 'billNormal'
                | 'billFinalized'
                | 'instructionSet'
                | 'lineCancelled'
                | 'lineDiscounted';
              message: string;
              user: string;
              data?: any;
            };
          },
      );
      activitiesList.forEach((activity) => {
        console.log('Activity:', activity.activity.user);
        let userIndex = analyticsData.salesChannels.all.userWiseActions.findIndex(
          (u) => u.userId === activity.activity.user,
        );
        const KOT_ACTIVITY = ['newKot','kotPrinted','kotEdited','kotCancelled','lineCancelled'];
        const BILL_ACTIVITY = ['billPrinted','billEdited','billCancelled','billSplit','customerDetailEntered','billNormal','billFinalized','instructionSet','billReactivated'];
        const DISCOUNT_ACTIVITY = ['billDiscounted','lineDiscounted'];
        const SETTLE_ACTIVITY = ['billSettled'];
        const NC_ACTIVITY = ['billNC'];
        if (userIndex === -1) {
          analyticsData.salesChannels.all.userWiseActions.push({
            userId: activity.activity.user,
            userRef: null,
            actions: {
              bills: BILL_ACTIVITY.includes(activity.activity.type) ? [activity] : [],
              kots: KOT_ACTIVITY.includes(activity.activity.type) ? [activity] : [],
              discounts: DISCOUNT_ACTIVITY.includes(activity.activity.type) ? [activity] : [],
              settlements: SETTLE_ACTIVITY.includes(activity.activity.type) ? [activity] : [],
              ncs: NC_ACTIVITY.includes(activity.activity.type) ? [activity] : [],
            },
          });
        } else {
          if (BILL_ACTIVITY.includes(activity.activity.type)) {
            analyticsData.salesChannels.all.userWiseActions[userIndex].actions.bills.push(activity);
          } else if (KOT_ACTIVITY.includes(activity.activity.type)) {
            analyticsData.salesChannels.all.userWiseActions[userIndex].actions.kots.push(activity);
          } else if (DISCOUNT_ACTIVITY.includes(activity.activity.type)) {
            analyticsData.salesChannels.all.userWiseActions[userIndex].actions.discounts.push(activity);
          } else if (SETTLE_ACTIVITY.includes(activity.activity.type)) {
            analyticsData.salesChannels.all.userWiseActions[userIndex].actions.settlements.push(activity);
          } else if (NC_ACTIVITY.includes(activity.activity.type)) {
            analyticsData.salesChannels.all.userWiseActions[userIndex].actions.ncs.push(activity);
          }
        }

        // add suspicious activities includes bill cancelled, line cancelled, bill discounted, line discounted, bill nc, bill split, bill settled
        if (
          activity.activity.type === 'billCancelled' ||
          activity.activity.type === 'lineCancelled' ||
          activity.activity.type === 'billDiscounted' ||
          activity.activity.type === 'lineDiscounted' ||
          activity.activity.type === 'billNC' ||
          activity.activity.type === 'billSplit'
        ) {
          analyticsData.salesChannels.all.suspiciousActivities.push(
            activity,
          );
        }
      });
      // generate suspicious activities by categorizing them into bills, kots, discounts
      // analyticsData.salesChannels.all.userWiseActions
      // for dineIn
      if (data.mode === 'dineIn') {
        if (data?.settlement?.stage == 'settled'){
          analyticsData.salesChannels.dineIn.totalSettledBills += 1;
        } else {
          analyticsData.salesChannels.dineIn.totalUnsettledBills += 1;
        }
        if (data?.billing?.discount?.length > 0){
        analyticsData.salesChannels.dineIn.totalDiscountedBills += 1;
      }
      if (data?.nonChargeableDetail){
        analyticsData.salesChannels.dineIn.totalNcBills += 1;
      }
        analyticsData.salesChannels.dineIn.totalSales +=
          data.billing.grandTotal;
        analyticsData.salesChannels.dineIn.netSales +=
          data.billing.grandTotal -
          data.billing.discount.reduce(
            (total: number, d: any) => d.totalAppliedDiscount + total,
            0,
          );
        analyticsData.salesChannels.dineIn.totalDiscount +=
          data.billing.discount.reduce(
            (total: number, d: any) => d.totalAppliedDiscount + total,
            0,
          );
        if (data.nonChargeableDetail) {
          analyticsData.salesChannels.dineIn.totalNC += data.billing.grandTotal;
        }
        analyticsData.salesChannels.dineIn.totalTaxes +=
          data.billing.taxes.reduce(
            (total: number, t: any) => t.amount + total,
            0,
          );
        analyticsData.salesChannels.dineIn.hourlySales[
          data.createdDate.toDate().getHours()
        ] += data.billing.grandTotal;
        analyticsData.salesChannels.dineIn.billWiseSales.rangeWise[
          data.billing.grandTotal < 500
            ? 'lowRange'
            : data.billing.grandTotal < 1000
            ? 'mediumRange'
            : 'highRange'
        ].bills.push({
          billId: billDoc.id,
          billRef: billDoc.ref,
          time: data.createdDate,
          totalSales: data.billing.grandTotal,
        });
        if (data.settlement?.payments) {
          data.settlement?.payments.forEach((payment: any) => {
            if (!analyticsData.salesChannels.dineIn.paymentReceived[payment.paymentMethod]){
              analyticsData.salesChannels.dineIn.paymentReceived[payment.paymentMethod] = 0;
            }
            analyticsData.salesChannels.dineIn.paymentReceived[payment.paymentMethod] += payment.amount;
          })
        }
        // analyticsData.salesChannels.dineIn.billWiseSales.tableWise
        // find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
        let tableIndex = analyticsData.salesChannels.dineIn.billWiseSales.tableWise.findIndex(
          (t) => t.table === data.table,
        );
        if (tableIndex === -1) {
          analyticsData.salesChannels.dineIn.billWiseSales.tableWise.push({
            table: data.table,
            bills: [
              {
                billId: billDoc.id,
                billRef: billDoc.ref,
                time: data.createdDate,
                totalSales: data.billing.grandTotal,
              },
            ],
            totalSales: data.billing.grandTotal,
            totalBills: 1,
          });
        } else {
          analyticsData.salesChannels.dineIn.billWiseSales.tableWise[
            tableIndex
          ].bills.push({
            billId: billDoc.id,
            billRef: billDoc.ref,
            time: data.createdDate,
            totalSales: data.billing.grandTotal,
          });
          analyticsData.salesChannels.dineIn.billWiseSales.tableWise[
            tableIndex
          ].totalSales += data.billing.grandTotal;
          analyticsData.salesChannels.dineIn.billWiseSales.tableWise[
            tableIndex
          ].totalBills += 1;
        }
        // analyticsData.salesChannels.dineIn.billWiseSales.time
        // find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
        let timeIndex = analyticsData.salesChannels.dineIn.billWiseSales.time.findIndex(
          (t) => t.time === data.createdDate.toDate().getHours(),
        );
        if (timeIndex === -1) {
          analyticsData.salesChannels.dineIn.billWiseSales.time.push({
            time: data.createdDate.toDate().getHours(),
            bills: [
              {
                billId: billDoc.id,
                billRef: billDoc.ref,
                time: data.createdDate,
                totalSales: data.billing.grandTotal,
              }
            ],
            totalSales: data.billing.grandTotal,
            totalBills: 1,
          });
        } else {
          analyticsData.salesChannels.dineIn.billWiseSales.time[
            timeIndex
          ].bills.push({
            billId: billDoc.id,
            billRef: billDoc.ref,
            time: data.createdDate,
            totalSales: data.billing.grandTotal,
          });
          analyticsData.salesChannels.dineIn.billWiseSales.time[
            timeIndex
          ].totalSales += data.billing.grandTotal;
          analyticsData.salesChannels.dineIn.billWiseSales.time[
            timeIndex
          ].totalBills += 1;
        }
      } else if (data.mode === 'takeaway') {
        if (data?.settlement?.stage == 'settled'){
          analyticsData.salesChannels.takeaway.totalSettledBills += 1;
        } else {
          analyticsData.salesChannels.takeaway.totalUnsettledBills += 1;
        }
        if (data?.billing?.discount?.length > 0){
        analyticsData.salesChannels.takeaway.totalDiscountedBills += 1;
      }
      if (data?.nonChargeableDetail){
        analyticsData.salesChannels.takeaway.totalNcBills += 1;
      }
        analyticsData.salesChannels.takeaway.totalSales +=
          data.billing.grandTotal;
        analyticsData.salesChannels.takeaway.netSales +=
          data.billing.grandTotal -
          data.billing.discount.reduce(
            (total: number, d: any) => d.totalAppliedDiscount + total,
            0,
          );
        analyticsData.salesChannels.takeaway.totalDiscount +=
          data.billing.discount.reduce(
            (total: number, d: any) => d.totalAppliedDiscount + total,
            0,
          );
        if (data.nonChargeableDetail) {
          analyticsData.salesChannels.takeaway.totalNC +=
            data.billing.grandTotal;
        }
        analyticsData.salesChannels.takeaway.totalTaxes +=
          data.billing.taxes.reduce(
            (total: number, t: any) => t.amount + total,
            0,
          );
        analyticsData.salesChannels.takeaway.hourlySales[
          data.createdDate.toDate().getHours()
        ] += data.billing.grandTotal;
        analyticsData.salesChannels.takeaway.billWiseSales.rangeWise[
          data.billing.grandTotal < 500
            ? 'lowRange'
            : data.billing.grandTotal < 1000
            ? 'mediumRange'
            : 'highRange'
        ].bills.push({
          billId: billDoc.id,
          billRef: billDoc.ref,
          time: data.createdDate,
          totalSales: data.billing.grandTotal,
        });
        if (data.settlement?.payments) {
          data.settlement?.payments.forEach((payment: any) => {
            if (!analyticsData.salesChannels.takeaway.paymentReceived[payment.paymentMethod]){
              analyticsData.salesChannels.takeaway.paymentReceived[payment.paymentMethod] = 0;
            }
            analyticsData.salesChannels.takeaway.paymentReceived[payment.paymentMethod] += payment.amount;
          })
        }
        // analyticsData.salesChannels.takeaway.billWiseSales.tableWise
        // find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
        let tableIndex = analyticsData.salesChannels.takeaway.billWiseSales.tableWise.findIndex(
          (t) => t.table === data.table,
        );
        if (tableIndex === -1) {
          analyticsData.salesChannels.takeaway.billWiseSales.tableWise.push({
            table: data.table,
            bills: [
              {
                billId: billDoc.id,
                billRef: billDoc.ref,
                time: data.createdDate,
                totalSales: data.billing.grandTotal,
              },
            ],
            totalSales: data.billing.grandTotal,
            totalBills: 1,
          });
        } else {
          analyticsData.salesChannels.takeaway.billWiseSales.tableWise[
            tableIndex
          ].bills.push({
            billId: billDoc.id,
            billRef: billDoc.ref,
            time: data.createdDate,
            totalSales: data.billing.grandTotal,
          });
          analyticsData.salesChannels.takeaway.billWiseSales.tableWise[
            tableIndex
          ].totalSales += data.billing.grandTotal;
          analyticsData.salesChannels.takeaway.billWiseSales.tableWise[
            tableIndex
          ].totalBills += 1;
        }
        // analyticsData.salesChannels.takeaway.billWiseSales.time
        // find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
        let timeIndex = analyticsData.salesChannels.takeaway.billWiseSales.time.findIndex(
          (t) => t.time === data.createdDate.toDate().getHours(),
        );
        if (timeIndex === -1) {
          analyticsData.salesChannels.takeaway.billWiseSales.time.push({
            time: data.createdDate.toDate().getHours(),
            bills: [
              {
                billId: billDoc.id,
                billRef: billDoc.ref,
                time: data.createdDate,
                totalSales: data.billing.grandTotal,
              }
            ],
            totalSales: data.billing.grandTotal,
            totalBills: 1,
          });
        } else {
          analyticsData.salesChannels.takeaway.billWiseSales.time[
            timeIndex
          ].bills.push({
            billId: billDoc.id,
            billRef: billDoc.ref,
            time: data.createdDate,
            totalSales: data.billing.grandTotal,
          });
          analyticsData.salesChannels.takeaway.billWiseSales.time[
            timeIndex
          ].totalSales += data.billing.grandTotal;
          analyticsData.salesChannels.takeaway.billWiseSales.time[
            timeIndex
          ].totalBills += 1;
        }
      } else if (data.mode === 'online') {
        if (data?.settlement?.stage == 'settled'){
          analyticsData.salesChannels.online.totalSettledBills += 1;
        } else {
          analyticsData.salesChannels.online.totalUnsettledBills += 1;
        }
        if (data?.billing?.discount?.length > 0){
        analyticsData.salesChannels.online.totalDiscountedBills += 1;
      }
      if (data?.nonChargeableDetail){
        analyticsData.salesChannels.online.totalNcBills += 1;
      }
        analyticsData.salesChannels.online.totalSales +=
          data.billing.grandTotal;
        analyticsData.salesChannels.online.netSales +=
          data.billing.grandTotal -
          data.billing.discount.reduce(
            (total: number, d: any) => d.totalAppliedDiscount + total,
            0,
          );
        analyticsData.salesChannels.online.totalDiscount +=
          data.billing.discount.reduce(
            (total: number, d: any) => d.totalAppliedDiscount + total,
            0,
          );
        if (data.nonChargeableDetail) {
          analyticsData.salesChannels.online.totalNC += data.billing.grandTotal;
        }
        analyticsData.salesChannels.online.totalTaxes +=
          data.billing.taxes.reduce(
            (total: number, t: any) => t.amount + total,
            0,
          );
        analyticsData.salesChannels.online.hourlySales[
          data.createdDate.toDate().getHours()
        ] += data.billing.grandTotal;
        analyticsData.salesChannels.online.billWiseSales.rangeWise[
          data.billing.grandTotal < 500
            ? 'lowRange'
            : data.billing.grandTotal < 1000
            ? 'mediumRange'
            : 'highRange'
        ].bills.push({
          billId: billDoc.id,
          billRef: billDoc.ref,
          time: data.createdDate,
          totalSales: data.billing.grandTotal,
        });
        if (data.settlement?.payments) {
          data.settlement?.payments.forEach((payment: any) => {
            if (!analyticsData.salesChannels.online.paymentReceived[payment.paymentMethod]){
              analyticsData.salesChannels.online.paymentReceived[payment.paymentMethod] = 0;
            }
            analyticsData.salesChannels.online.paymentReceived[payment.paymentMethod] += payment.amount;
          })
        }
        // analyticsData.salesChannels.online.billWiseSales.tableWise
        // find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
        let tableIndex = analyticsData.salesChannels.online.billWiseSales.tableWise.findIndex(
          (t) => t.table === data.table,
        );
        if (tableIndex === -1) {
          analyticsData.salesChannels.online.billWiseSales.tableWise.push({
            table: data.table,
            bills: [
              {
                billId: billDoc.id,
                billRef: billDoc.ref,
                time: data.createdDate,
                totalSales: data.billing.grandTotal,
              },
            ],
            totalSales: data.billing.grandTotal,
            totalBills: 1,
          });
        } else {
          analyticsData.salesChannels.online.billWiseSales.tableWise[
            tableIndex
          ].bills.push({
            billId: billDoc.id,
            billRef: billDoc.ref,
            time: data.createdDate,
            totalSales: data.billing.grandTotal,
          });
          analyticsData.salesChannels.online.billWiseSales.tableWise[
            tableIndex
          ].totalSales += data.billing.grandTotal;
          analyticsData.salesChannels.online.billWiseSales.tableWise[
            tableIndex
          ].totalBills += 1;
        }
        // analyticsData.salesChannels.online.billWiseSales.time
        // find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
        let timeIndex = analyticsData.salesChannels.online.billWiseSales.time.findIndex(
          (t) => t.time === data.createdDate.toDate().getHours(),
        );
        if (timeIndex === -1) {
          analyticsData.salesChannels.online.billWiseSales.time.push({
            time: data.createdDate.toDate().getHours(),
            bills: [
              {
                billId: billDoc.id,
                billRef: billDoc.ref,
                time: data.createdDate,
                totalSales: data.billing.grandTotal,
              }
            ],
            totalSales: data.billing.grandTotal,
            totalBills: 1,
          });
        } else {
          analyticsData.salesChannels.online.billWiseSales.time[
            timeIndex
          ].bills.push({
            billId: billDoc.id,
            billRef: billDoc.ref,
            time: data.createdDate,
            totalSales: data.billing.grandTotal,
          });
          analyticsData.salesChannels.online.billWiseSales.time[
            timeIndex
          ].totalSales += data.billing.grandTotal;
          analyticsData.salesChannels.online.billWiseSales.time[
            timeIndex
          ].totalBills += 1;
        }
      }
    }),
  );
  // sort billWiseSales by time
  analyticsData.salesChannels.all.billWiseSales.rangeWise.lowRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.all.billWiseSales.rangeWise.mediumRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.all.billWiseSales.rangeWise.highRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  // sort suspicious activities by time
  analyticsData.salesChannels.all.suspiciousActivities.sort(
    (a, b) => a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
  );
  // sort itemWiseSales by price
  analyticsData.salesChannels.all.itemWiseSales.byPrice.sort(
    (a, b) => b.price - a.price,
  );
  analyticsData.salesChannels.all.itemWiseSales.byPriceMax = analyticsData.salesChannels.all.itemWiseSales.byPrice[0].price;
  // sort itemWiseSales by quantity
  analyticsData.salesChannels.all.itemWiseSales.byQuantity.sort(
    (a, b) => b.quantity - a.quantity,
  );
  // for dineIn
  analyticsData.salesChannels.all.itemWiseSales.byQuantityMax = analyticsData.salesChannels.all.itemWiseSales.byQuantity[0].quantity;
  // sort billWiseSales by time
  analyticsData.salesChannels.dineIn.billWiseSales.rangeWise.lowRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.dineIn.billWiseSales.rangeWise.mediumRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.dineIn.billWiseSales.rangeWise.highRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  // sort suspicious activities by time
  analyticsData.salesChannels.dineIn.suspiciousActivities.sort(
    (a, b) => a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
  );
  // sort itemWiseSales by price
  analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.sort(
    (a, b) => b.price - a.price,
  );
  // sort itemWiseSales by quantity
  analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity.sort(
    (a, b) => b.quantity - a.quantity,
  );
  // for takeaway
  // sort billWiseSales by time
  analyticsData.salesChannels.takeaway.billWiseSales.rangeWise.lowRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.takeaway.billWiseSales.rangeWise.mediumRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.takeaway.billWiseSales.rangeWise.highRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  // sort suspicious activities by time
  analyticsData.salesChannels.takeaway.suspiciousActivities.sort(
    (a, b) => a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
  );
  // sort itemWiseSales by price
  analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.sort(
    (a, b) => b.price - a.price,
  );
  // sort itemWiseSales by quantity
  analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity.sort(
    (a, b) => b.quantity - a.quantity,
  );
  // for online
  // sort billWiseSales by time
  analyticsData.salesChannels.online.billWiseSales.rangeWise.lowRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.online.billWiseSales.rangeWise.mediumRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  analyticsData.salesChannels.online.billWiseSales.rangeWise.highRange.bills.sort(
    (a, b) => a.time.toDate().getTime() - b.time.toDate().getTime(),
  );
  // sort suspicious activities by time
  analyticsData.salesChannels.online.suspiciousActivities.sort(
    (a, b) => a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
  );
  // sort itemWiseSales by price
  analyticsData.salesChannels.online.itemWiseSales.byPrice.sort(
    (a, b) => b.price - a.price,
  );
  // sort itemWiseSales by quantity
  analyticsData.salesChannels.online.itemWiseSales.byQuantity.sort(
    (a, b) => b.quantity - a.quantity,
  );
  // add this analyticsData to business/id/analyticsData/2021/01/01
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  await firestore
    .doc(`business/${businessDoc.id}/analyticsData/${year}/${month}/${day}`)
    .set(analyticsData);
  return { ...analyticsData, analyzedBills: billsDocs.docs.length, addedPath:`business/${businessDoc.id}/analyticsData/${year}/${month}/${day}` };
}
