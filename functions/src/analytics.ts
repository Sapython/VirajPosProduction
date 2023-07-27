import { Timestamp } from "firebase-admin/firestore";
import { AnalyticsData } from ".";

export async function generateAnalytics(firestore:any,businessDoc:any){
	let prevAnalyticsData = await firestore.collection(`business/${businessDoc.id}/analytics`).get();
    let averageHourlySales:{
      all:number[],
      dineIn:number[],
      takeaway:number[],
      online:number[]
    }={
      all:[],
      dineIn:[],
      takeaway:[],
      online:[]
    }
    if (prevAnalyticsData.docs.length==0){
      for (let i=0; i++; i < 24){
        averageHourlySales.all.push(0);
        averageHourlySales.dineIn.push(0);
        averageHourlySales.takeaway.push(0);
        averageHourlySales.online.push(0);
      }
    } else {
      let salesData:{
        all:number[][],
        dineIn:number[][],
        takeaway:number[][],
        online:number[][]
      }={
        all:[],
        dineIn:[],
        takeaway:[],
        online:[]
      }
      prevAnalyticsData.docs.forEach((doc:any)=>{
        let data = doc.data();
        salesData.all.push(data.salesChannels.all.hourlySales);
        salesData.dineIn.push(data.salesChannels.dineIn.hourlySales);
        salesData.takeaway.push(data.salesChannels.takeaway.hourlySales);
        salesData.online.push(data.salesChannels.online.hourlySales);
      })
      for (let i=0; i++; i < 24){
        let total = 0;
        salesData.all.forEach((hourlySales)=>{
          total += hourlySales[i];
        })
        averageHourlySales.all.push(total/salesData.all.length);
        total = 0;
        salesData.dineIn.forEach((hourlySales)=>{
          total += hourlySales[i];
        })
        averageHourlySales.dineIn.push(total/salesData.dineIn.length);
        total = 0;
        salesData.takeaway.forEach((hourlySales)=>{
          total += hourlySales[i];
        })
        averageHourlySales.takeaway.push(total/salesData.takeaway.length);
        total = 0;
        salesData.online.forEach((hourlySales)=>{
          total += hourlySales[i];
        })
        averageHourlySales.online.push(total/salesData.online.length);
      }
    }
    let bills = firestore.collection(`business/${businessDoc.id}/bills`).where('createdDate','>=',Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))).where('createdDate','<=',Timestamp.fromDate(new Date(Date.now())));
    let billsDocs = await bills.get();
    
    let analyticsData:AnalyticsData = {
      salesChannels:{
        all:{
          totalSales:0,
          netSales:0,
          totalDiscount:0,
          totalNC:0,
          totalTaxes:0,
          hourlySales:[...new Array(24).fill(0)],
          averageHourlySales:averageHourlySales.all,
          paymentReceived:{
            cash:0,
            card:0,
            upi:0
          },
          billWiseSales:{
            lowRange:{
              bills:[],
              totalSales:0,
            },
            mediumRange:{
              bills:[],
              totalSales:0,
            },
            highRange:{
              bills:[],
              totalSales:0,
            },
          },
          itemWiseSales:{
            byPrice:[],
            byQuantity:[]
          },
          suspiciousActivities:{
            bills:[],
            kots:[],
            discounts:[],
            users:[],
          },
          userWiseActions:[
            {
              userId:'',
              userRef:null,
              actions:{
                bills:[],
                kots:[],
                discounts:[],
                settlements:[],
                ncs:[],
              }
            }
          ]
        },
        dineIn:{
          totalSales:0,
          netSales:0,
          totalDiscount:0,
          totalNC:0,
          totalTaxes:0,
          hourlySales:[],
          averageHourlySales:averageHourlySales.dineIn,
          paymentReceived:{
            cash:0,
            card:0,
            upi:0
          },
          billWiseSales:{
            lowRange:{
              bills:[],
              totalSales:0,
            },
            mediumRange:{
              bills:[],
              totalSales:0,
            },
            highRange:{
              bills:[],
              totalSales:0,
            },
          },
          itemWiseSales:{
            byPrice:[],
            byQuantity:[]
          },
          suspiciousActivities:{
            bills:[],
            kots:[],
            discounts:[],
            users:[],
          },
          userWiseActions:[
            {
              userId:'',
              userRef:null,
              actions:{
                bills:[],
                kots:[],
                discounts:[],
                settlements:[],
                ncs:[],
              }
            }
          ]
        },
        takeaway:{
          totalSales:0,
          netSales:0,
          totalDiscount:0,
          totalNC:0,
          totalTaxes:0,
          hourlySales:[],
          averageHourlySales:averageHourlySales.takeaway,
          paymentReceived:{
            cash:0,
            card:0,
            upi:0
          },
          billWiseSales:{
            lowRange:{
              bills:[],
              totalSales:0,
            },
            mediumRange:{
              bills:[],
              totalSales:0,
            },
            highRange:{
              bills:[],
              totalSales:0,
            },
          },
          itemWiseSales:{
            byPrice:[],
            byQuantity:[]
          },
          suspiciousActivities:{
            bills:[],
            kots:[],
            discounts:[],
            users:[],
          },
          userWiseActions:[
            {
              userId:'',
              userRef:null,
              actions:{
                bills:[],
                kots:[],
                discounts:[],
                settlements:[],
                ncs:[],
              }
            }
          ]
        },
        online:{
          totalSales:0,
          netSales:0,
          totalDiscount:0,
          totalNC:0,
          totalTaxes:0,
          hourlySales:[],
          averageHourlySales:averageHourlySales.online,
          paymentReceived:{
            cash:0,
            card:0,
            upi:0
          },
          billWiseSales:{
            lowRange:{
              bills:[],
              totalSales:0,
            },
            mediumRange:{
              bills:[],
              totalSales:0,
            },
            highRange:{
              bills:[],
              totalSales:0,
            },
          },
          itemWiseSales:{
            byPrice:[],
            byQuantity:[]
          },
          suspiciousActivities:{
            bills:[],
            kots:[],
            discounts:[],
            users:[],
          },
          userWiseActions:[
            {
              userId:'',
              userRef:null,
              actions:{
                bills:[],
                kots:[],
                discounts:[],
                settlements:[],
                ncs:[],
              }
            }
          ]
        },
      },
      customersData:{
        totalCustomers:0,
        totalCustomersByChannel:{
          dineIn:0,
          takeaway:0,
          online:0,
        },
        totalNewCustomers:0,
        totalNewCustomersByChannel:{
          dineIn:0,
          takeaway:0,
          online:0,
        },
        newCustomers:[],
        allCustomers:[],
      }
    };
    analyticsData.salesChannels.all.hourlySales = new Array(24).fill(0);
    analyticsData.salesChannels.online.hourlySales = new Array(24).fill(0);
    analyticsData.salesChannels.takeaway.hourlySales = new Array(24).fill(0);
    analyticsData.salesChannels.dineIn.hourlySales = new Array(24).fill(0);
    await Promise.all(billsDocs.docs.map(async (billDoc:any) => {
    	//   let data:BillConstructor = billDoc.data() as any;
    	let data = billDoc.data() as any;
      // console.log("BILL DATA:",data);
      // business/businessId/bills/billId/activities
      let activities = firestore.collection(`business/${businessDoc.id}/bills/${billDoc.id}/activities`);
      let activitiesDocs = await activities.get();
      analyticsData.salesChannels.all.totalSales += data.billing.grandTotal;
      console.log("BILL Total:",data.billing.grandTotal);
      analyticsData.salesChannels.all.netSales += data.billing.grandTotal - data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
      analyticsData.salesChannels.all.totalDiscount += data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
      if (data.nonChargeableDetail){
        analyticsData.salesChannels.all.totalNC += data.billing.grandTotal;
      }
      analyticsData.salesChannels.all.totalTaxes += data.billing.taxes.reduce((total:number,t:any)=>t.amount+total,0);
      analyticsData.salesChannels.all.hourlySales[data.createdDate.toDate().getHours()] += data.billing.grandTotal;
      analyticsData.salesChannels.all.billWiseSales[data.billing.grandTotal<500? 'lowRange':data.billing.grandTotal<1000? 'mediumRange':'highRange'].bills.push({
        billId:billDoc.id,
        billRef:billDoc.ref,
        time:data.createdDate,
        totalSales:data.billing.grandTotal,
      });
      let items = data.kots.map((kot:any)=>{
        return kot.products.map((product:any)=>{
          return product;
        })
      }).flat();
      items.forEach((item:any)=>{
        let itemIndex = analyticsData.salesChannels.all.itemWiseSales.byPrice.findIndex((i)=>i.id===item.id);
        if (itemIndex===-1){
          analyticsData.salesChannels.all.itemWiseSales.byPrice.push({
            name:item.name,
            quantity:item.quantity,
            price:item.price,
            category:item.category,
            id:item.id || '',
          });
          analyticsData.salesChannels.all.itemWiseSales.byQuantity.push({
            name:item.name,
            quantity:item.quantity,
            price:item.price,
            category:item.category,
            id:item.id || '',
          });
        } else {
          analyticsData.salesChannels.all.itemWiseSales.byPrice[itemIndex].quantity += item.quantity;
          analyticsData.salesChannels.all.itemWiseSales.byPrice[itemIndex].price += item.quantity*item.price;
          analyticsData.salesChannels.all.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity;
          analyticsData.salesChannels.all.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity*item.price;
        }
        if (data.mode == 'dineIn'){
          let itemIndex = analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.findIndex((i)=>i.id===item.id);
          if (itemIndex===-1){
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.push({
              name:item.name,
              quantity:item.quantity,
              price:item.price,
              category:item.category,
              id:item.id || '',
            });
            analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity.push({
              name:item.name,
              quantity:item.quantity,
              price:item.price,
              category:item.category,
              id:item.id || '',
            });
          } else {
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[itemIndex].quantity += item.quantity;
            analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[itemIndex].price += item.quantity*item.price;
            analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity;
            analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity*item.price;
          }
        } else if (data.mode == 'takeaway'){
          let itemIndex = analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.findIndex((i)=>i.id===item.id);
          if (itemIndex===-1){
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.push({
              name:item.name,
              quantity:item.quantity,
              price:item.price,
              category:item.category,
              id:item.id || '',
            });
            analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity.push({
              name:item.name,
              quantity:item.quantity,
              price:item.price,
              category:item.category,
              id:item.id || '',
            });
          } else {
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[itemIndex].quantity += item.quantity;
            analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[itemIndex].price += item.quantity*item.price;
            analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity;
            analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity*item.price;
          }
        } else if (data.mode == 'online'){
          let itemIndex = analyticsData.salesChannels.online.itemWiseSales.byPrice.findIndex((i)=>i.id===item.id);
          if (itemIndex===-1){
            analyticsData.salesChannels.online.itemWiseSales.byPrice.push({
              name:item.name,
              quantity:item.quantity,
              price:item.price,
              category:item.category,
              id:item.id || '',
            });
            analyticsData.salesChannels.online.itemWiseSales.byQuantity.push({
              name:item.name,
              quantity:item.quantity,
              price:item.price,
              category:item.category,
              id:item.id || '',
            });
          } else {
            analyticsData.salesChannels.online.itemWiseSales.byPrice[itemIndex].quantity += item.quantity;
            analyticsData.salesChannels.online.itemWiseSales.byPrice[itemIndex].price += item.quantity*item.price;
            analyticsData.salesChannels.online.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity;
            analyticsData.salesChannels.online.itemWiseSales.byQuantity[itemIndex].quantity += item.quantity*item.price;
          }
        }
      })
      // sort itemWiseSales by price
      analyticsData.salesChannels.all.itemWiseSales.byPrice.sort((a,b)=>b.price-a.price);
      // sort itemWiseSales by quantity
      analyticsData.salesChannels.all.itemWiseSales.byQuantity.sort((a,b)=>b.quantity-a.quantity);
      // suspicious activities
      let activitiesList = activitiesDocs.docs.map((doc:any)=>doc.data() as {
        createdDate:Timestamp,
        activity:{
          type:'newKot'|'kotPrinted'|'kotEdited'|'kotCancelled'|'billPrinted'|'billEdited'|'billCancelled'|'billSettled'|'billSplit'|'billDiscounted'|'billNC'|'customerDetailEntered'|'billNormal'|'billFinalized'|'instructionSet'|'lineCancelled'|'lineDiscounted',
          message:string,
          user:string;
          data?:any;
        }
      });
      // generate suspicious activities by categorizing them into bills, kots, discounts
      activitiesList.forEach((activity:any)=>{
        if (['newKot','kotPrinted','kotEdited','kotCancelled','lineDiscounted','lineCancelled'].includes(activity.activity.type)){
          analyticsData.salesChannels.all.suspiciousActivities.kots.push({
            billId:billDoc.id,
            billRef:billDoc.ref,
            billPrice:data.billing.grandTotal,
            reason:activity.activity.message,
            time:activity.createdDate,
            type:activity.activity.type,
            userId:activity.activity.user,
            kot:activity.activity.data,
            kotId:activity.activity.data.id,
          });
          // analyticsData.salesChannels.all.userWiseActions[activity.activity.user].kots.push({})
          // let userIndex = analyticsData.salesChannels.all.userWiseActions.findIndex((u)=>u.userId===activity.activity.user);
          // if (userIndex===-1){
          //   analyticsData.salesChannels.all.userWiseActions.push({
          //     userId:activity.activity.user,
          //     actions:{
          //       kots:[
          //         {
          //           billId:billDoc.id,
          //         }
          //       ],
          //     }
              
          //     bills:[],
          //     discounts:[],
          //   });
          // } else {
          //   analyticsData.salesChannels.all.userWiseActions[userIndex].kots.push({
          //     billId:billDoc.id,
          //     billRef:billDoc.ref,
          //     billPrice:data.billing.grandTotal,
          //     reason:activity.activity.message,
          //     time:activity.createdDate,
          //     type:activity.activity.type,
          //     userId:activity.activity.user,
          //     kot:activity.activity.data,
          //     kotId:activity.activity.data.id,
          //   });
          // }
        } else if (['billPrinted','billEdited','billCancelled','billSettled','billSplit','billDiscounted','billNC','customerDetailEntered','billNormal','billFinalized','instructionSet'].includes(activity.activity.type)){
          analyticsData.salesChannels.all.suspiciousActivities.bills.push({
            billId:billDoc.id,
            billRef:billDoc.ref,
            price:data.billing.grandTotal,
            reason:activity.activity.message,
            time:activity.createdDate,
            type:activity.activity.type,
            userId:activity.activity.user,
          });
        } else if (['lineDiscount','billDiscounted'].includes(activity.activity.type)){
          analyticsData.salesChannels.all.suspiciousActivities.discounts.push({
            billId:billDoc.id,
            billRef:billDoc.ref,
            price:data.billing.grandTotal,
            reason:activity.activity.message,
            time:activity.createdDate,
            type:activity.activity.type,
            userId:activity.activity.user,
          });
        }
      })
      // for dineIn 
      if (data.mode==='dineIn'){
        analyticsData.salesChannels.dineIn.totalSales += data.billing.grandTotal;
        analyticsData.salesChannels.dineIn.netSales += data.billing.grandTotal - data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
        analyticsData.salesChannels.dineIn.totalDiscount += data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
        if (data.nonChargeableDetail){
          analyticsData.salesChannels.dineIn.totalNC += data.billing.grandTotal;
        }
        analyticsData.salesChannels.dineIn.totalTaxes += data.billing.taxes.reduce((total:number,t:any)=>t.amount+total,0);
        analyticsData.salesChannels.dineIn.hourlySales[data.createdDate.toDate().getHours()] += data.billing.grandTotal;
        analyticsData.salesChannels.dineIn.billWiseSales[data.billing.grandTotal<500? 'lowRange':data.billing.grandTotal<1000? 'mediumRange':'highRange'].bills.push({
          billId:billDoc.id,
          billRef:billDoc.ref,
          time:data.createdDate,
          totalSales:data.billing.grandTotal,
        });
      } else if (data.mode==='takeaway'){
        analyticsData.salesChannels.takeaway.totalSales += data.billing.grandTotal;
        analyticsData.salesChannels.takeaway.netSales += data.billing.grandTotal - data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
        analyticsData.salesChannels.takeaway.totalDiscount += data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
        if (data.nonChargeableDetail){
          analyticsData.salesChannels.takeaway.totalNC += data.billing.grandTotal;
        }
        analyticsData.salesChannels.takeaway.totalTaxes += data.billing.taxes.reduce((total:number,t:any)=>t.amount+total,0);
        analyticsData.salesChannels.takeaway.hourlySales[data.createdDate.toDate().getHours()] += data.billing.grandTotal;
        analyticsData.salesChannels.takeaway.billWiseSales[data.billing.grandTotal<500? 'lowRange':data.billing.grandTotal<1000? 'mediumRange':'highRange'].bills.push({
          billId:billDoc.id,
          billRef:billDoc.ref,
          time:data.createdDate,
          totalSales:data.billing.grandTotal,
        });
      } else if (data.mode==='online'){
        analyticsData.salesChannels.online.totalSales += data.billing.grandTotal;
        analyticsData.salesChannels.online.netSales += data.billing.grandTotal - data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
        analyticsData.salesChannels.online.totalDiscount += data.billing.discount.reduce((total:number,d:any)=>d.totalAppliedDiscount+total,0);
        if (data.nonChargeableDetail){
          analyticsData.salesChannels.online.totalNC += data.billing.grandTotal;
        }
        analyticsData.salesChannels.online.totalTaxes += data.billing.taxes.reduce((total:number,t:any)=>t.amount+total,0);
        analyticsData.salesChannels.online.hourlySales[data.createdDate.toDate().getHours()] += data.billing.grandTotal;
        analyticsData.salesChannels.online.billWiseSales[data.billing.grandTotal<500? 'lowRange':data.billing.grandTotal<1000? 'mediumRange':'highRange'].bills.push({
          billId:billDoc.id,
          billRef:billDoc.ref,
          time:data.createdDate,
          totalSales:data.billing.grandTotal,
        });
      }
    }));
    // sort billWiseSales by time
    analyticsData.salesChannels.all.billWiseSales.lowRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.all.billWiseSales.mediumRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.all.billWiseSales.highRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort suspicious activities by time
    analyticsData.salesChannels.all.suspiciousActivities.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.all.suspiciousActivities.kots.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.all.suspiciousActivities.discounts.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort itemWiseSales by price
    analyticsData.salesChannels.all.itemWiseSales.byPrice.sort((a,b)=>b.price-a.price);
    // sort itemWiseSales by quantity
    analyticsData.salesChannels.all.itemWiseSales.byQuantity.sort((a,b)=>b.quantity-a.quantity);
    // for dineIn
    // sort billWiseSales by time
    analyticsData.salesChannels.dineIn.billWiseSales.lowRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.dineIn.billWiseSales.mediumRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.dineIn.billWiseSales.highRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort suspicious activities by time
    analyticsData.salesChannels.dineIn.suspiciousActivities.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.dineIn.suspiciousActivities.kots.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.dineIn.suspiciousActivities.discounts.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort itemWiseSales by price
    analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.sort((a,b)=>b.price-a.price);
    // sort itemWiseSales by quantity
    analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity.sort((a,b)=>b.quantity-a.quantity);
    // for takeaway
    // sort billWiseSales by time
    analyticsData.salesChannels.takeaway.billWiseSales.lowRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.takeaway.billWiseSales.mediumRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.takeaway.billWiseSales.highRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort suspicious activities by time
    analyticsData.salesChannels.takeaway.suspiciousActivities.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.takeaway.suspiciousActivities.kots.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.takeaway.suspiciousActivities.discounts.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort itemWiseSales by price
    analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.sort((a,b)=>b.price-a.price);
    // sort itemWiseSales by quantity
    analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity.sort((a,b)=>b.quantity-a.quantity);
    // for online
    // sort billWiseSales by time
    analyticsData.salesChannels.online.billWiseSales.lowRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.online.billWiseSales.mediumRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.online.billWiseSales.highRange.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort suspicious activities by time
    analyticsData.salesChannels.online.suspiciousActivities.bills.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.online.suspiciousActivities.kots.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    analyticsData.salesChannels.online.suspiciousActivities.discounts.sort((a,b)=>a.time.toDate().getTime()-b.time.toDate().getTime());
    // sort itemWiseSales by price
    analyticsData.salesChannels.online.itemWiseSales.byPrice.sort((a,b)=>b.price-a.price);
    // sort itemWiseSales by quantity
    analyticsData.salesChannels.online.itemWiseSales.byQuantity.sort((a,b)=>b.quantity-a.quantity);
    // add this analyticsData to business/id/analyticsData/2021/01/01
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    await firestore.doc(`business/${businessDoc.id}/analyticsData/${year}/${month}/${day}`).set(analyticsData);
    return {...analyticsData,analyzedBills:billsDocs.docs.length};
}