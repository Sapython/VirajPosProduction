// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore, getDoc, doc, Timestamp, Firestore, getDocs, collection,query, where,setDoc} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATbn4lcWC9FwXTIHpA9iVyeADvdExh-bo",
  authDomain: "fbms-shreeva-demo.firebaseapp.com",
  databaseURL: "https://fbms-shreeva-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fbms-shreeva-demo",
  storageBucket: "fbms-shreeva-demo.appspot.com",
  messagingSenderId: "403464137223",
  appId: "1:403464137223:web:9a9e4c34c95bc766a858a2",
  measurementId: "G-T77N187VLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export async function generateAnalytics(firestore:Firestore, businessDoc: any) {
	let cachedTables: any[] = [];
	// /business/uqd9dm0its2v9xx6fey2q/analyticsData/2023/7
	console.log('Fetching for date', new Date().toDateString());
  
	// let prevAnalyticsData = await firestore
	//   .collection(
		// `business/${businessDoc.id}/analyticsData/${new Date().getFullYear()}/${
		//   new Date().getMonth() + 1
		// }`,
	//   )
	//   .get();
	let prevAnalyticsData = await getDocs(collection(firestore, `business/${businessDoc.id}/analyticsData/${new Date().getFullYear()}/${
		new Date().getMonth() + 1
	  }`));
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
		  total += isValidNumber(hourlySales[i]);
		});
		averageHourlySales.all.push(total / salesData.all.length);
		total = 0;
		salesData.dineIn.forEach((hourlySales) => {
		  total += isValidNumber(hourlySales[i]);
		});
		averageHourlySales.dineIn.push(total / salesData.dineIn.length);
		total = 0;
		salesData.takeaway.forEach((hourlySales) => {
		  total += isValidNumber(hourlySales[i]);
		});
		averageHourlySales.takeaway.push(total / salesData.takeaway.length);
		total = 0;
		salesData.online.forEach((hourlySales) => {
		  total += isValidNumber(hourlySales[i]);
		});
		averageHourlySales.online.push(total / salesData.online.length);
	  }
	  // console.log("Final sales data",salesData,);
	}
	let today = new Date();
	// set hours to 0
	today.setHours(0, 0, 0, 0);
	let todayEnd = new Date();
	// set hours to 23
	todayEnd.setHours(23, 59, 59, 999);
	// console.log("Added prev analytics",averageHourlySales);
	// let bills = firestore
	//   .collection(`business/${businessDoc.id}/bills`)
	//   .where('createdDate', '>=', today)
	//   .where('createdDate', '<=', todayEnd);

	let bills = query(collection(firestore, `business/${businessDoc.id}/bills`),where('createdDate', '>=', today),where('createdDate', '<=', todayEnd))

	let billsDocs = await getDocs(bills);
	console.log('Total bills', billsDocs.docs.length);
  
	let analyticsData: AnalyticsData = {
	  createdAt: Timestamp.fromDate(new Date()),
	  createdAtUTC: new Date().toUTCString(),
	  salesChannels: {
		all: {
		  totalSales: 0,
		  netSales: 0,
		  totalDiscount: 0,
		  totalNC: 0,
		  totalTaxes: 0,
		  totalSettledBills: 0,
		  totalDiscountedBills: 0,
		  totalNcBills: 0,
		  totalUnsettledBills: 0,
		  hourlySales: [...new Array(24).fill(0)],
		  averageHourlySales: averageHourlySales.all,
		  paymentReceived: {},
		  billWiseSales: {
			rangeWise: {
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
			tableWise: [],
			time: [],
			maxTables: 0,
		  },
		  itemWiseSales: {
			byPrice: [],
			byQuantity: [],
			byPriceMax: 0,
			byQuantityMax: 0,
			priceTopCategory: {},
			quantityTopCategory: {},
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
		  totalDiscountedBills: 0,
		  totalNcBills: 0,
		  totalUnsettledBills: 0,
		  hourlySales: [],
		  averageHourlySales: averageHourlySales.dineIn,
		  paymentReceived: {},
		  billWiseSales: {
			rangeWise: {
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
			tableWise: [],
			time: [],
			maxTables: 0,
		  },
		  itemWiseSales: {
			byPrice: [],
			byQuantity: [],
			byPriceMax: 0,
			byQuantityMax: 0,
			priceTopCategory: {},
			quantityTopCategory: {},
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
		  totalDiscountedBills: 0,
		  totalNcBills: 0,
		  totalUnsettledBills: 0,
		  hourlySales: [],
		  averageHourlySales: averageHourlySales.takeaway,
		  paymentReceived: {},
		  billWiseSales: {
			rangeWise: {
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
			tableWise: [],
			time: [],
			maxTables: 0,
		  },
		  itemWiseSales: {
			byPrice: [],
			byQuantity: [],
			byPriceMax: 0,
			byQuantityMax: 0,
			priceTopCategory: {},
			quantityTopCategory: {},
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
		  totalDiscountedBills: 0,
		  totalNcBills: 0,
		  totalUnsettledBills: 0,
		  hourlySales: [],
		  averageHourlySales: averageHourlySales.online,
		  paymentReceived: {},
		  billWiseSales: {
			rangeWise: {
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
			tableWise: [],
			time: [],
			maxTables: 0,
		  },
		  itemWiseSales: {
			byPrice: [],
			byQuantity: [],
			byPriceMax: 0,
			byQuantityMax: 0,
			priceTopCategory: {},
			quantityTopCategory: {},
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
	try {
	  for (const billDoc of billsDocs.docs) {
		//   let data:BillConstructor = billDoc.data() as any;
		console.log("Checking for ",billDoc.id);
		let currentBill = billDoc.data() as any;
		// console.log("BILL DATA:",data);
		// business/businessId/bills/billId/activities
		// let activities = firestore.collection(
		//   `business/${businessDoc.id}/bills/${billDoc.id}/billActivities`,
		// );
		let activities = collection(firestore, `business/${businessDoc.id}/bills/${billDoc.id}/billActivities`);
		let activitiesDocs = await getDocs(activities);
		// console.log('activitiesDocs.length', activitiesDocs.docs.length);
		if (currentBill.billing.grandTotal) {
		  analyticsData.salesChannels.all.totalSales += isValidNumber(
			currentBill.billing.grandTotal,
		  );
		}
		// console.log('BILL Total:', data.billing.grandTotal);
		if (currentBill?.settlement?.time) {
		  analyticsData.salesChannels.all.totalSettledBills += 1;
		} else {
		  analyticsData.salesChannels.all.totalUnsettledBills += 1;
		}
		if (currentBill?.billing?.discount?.length > 0) {
		  analyticsData.salesChannels.all.totalDiscountedBills += 1;
		}
		if (currentBill?.nonChargeableDetail) {
		  analyticsData.salesChannels.all.totalNcBills += 1;
		}
		if (currentBill?.billing?.discount?.length > 0) {
		  analyticsData.salesChannels.all.totalDiscountedBills += 1;
		}
		if (currentBill?.nonChargeableDetail) {
		  analyticsData.salesChannels.all.totalNcBills += 1;
		}
		analyticsData.salesChannels.all.netSales += isValidNumber(
		  currentBill.billing.grandTotal -
			currentBill.billing.discount.reduce(
			  (total: number, d: any) => d.totalAppliedDiscount + total,
			  0,
			),
		);
		analyticsData.salesChannels.all.totalDiscount += isValidNumber(
		  currentBill.billing.discount.reduce(
			(total: number, d: any) => d.totalAppliedDiscount + total,
			0,
		  ),
		);
		if (currentBill.nonChargeableDetail) {
		  analyticsData.salesChannels.all.totalNC += isValidNumber(
			currentBill.billing.subTotal,
		  );
		}
		analyticsData.salesChannels.all.totalTaxes += isValidNumber(
		  currentBill.billing.taxes.reduce(
			(total: number, t: any) => t.amount + total,
			0,
		  ),
		);
		analyticsData.salesChannels.all.hourlySales[
		  currentBill.createdDate.toDate().getHours()
		] += isValidNumber(currentBill.billing.grandTotal);
		analyticsData.salesChannels.all.billWiseSales.rangeWise[
		  currentBill.billing.grandTotal < 500
			? 'lowRange'
			: currentBill.billing.grandTotal < 1000
			? 'mediumRange'
			: 'highRange'
		].bills.push({
		  billId: billDoc.id,
		  billRef: billDoc.ref,
		  time: currentBill.createdDate,
		  totalSales: isValidNumber(currentBill.billing.grandTotal),
		});
		console.log("Basic analytics done for all");
		
		// payment methods
		if (currentBill.settlement?.payments) {
		  currentBill.settlement?.payments.forEach((payment: any) => {
			if (
			  !analyticsData.salesChannels.all.paymentReceived[
				payment.paymentMethod
			  ]
			) {
			  analyticsData.salesChannels.all.paymentReceived[
				payment.paymentMethod
			  ] = 0;
			}
			analyticsData.salesChannels.all.paymentReceived[
			  payment.paymentMethod
			] += isValidNumber(payment.amount);
		  });
		}
		console.log("Payment analytics done for all");
		// analyticsData.salesChannels.all.billWiseSales.tableWise
		// find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
		let tableIndex =
		  analyticsData.salesChannels.all.billWiseSales.tableWise.findIndex(
			(t: any) => t.tableId == currentBill.table,
		  );
		console.log("Table index",tableIndex);
		  
		if (tableIndex === -1) {
		  if (currentBill.mode === 'dineIn'){
			var tablePath = `business/${businessDoc.id}/tables/${currentBill.table}`;
		  } else if (currentBill.mode === 'online'){
			var tablePath = `business/${businessDoc.id}/onlineTokens/${currentBill.table}`;
		  } else {
			var tablePath = `business/${businessDoc.id}/tokens/${currentBill.table}`;
		  }
		  console.log("Table path",tablePath);
		  // console.log('Table path', tablePath);
		  // find tablePath in cachedTables if not found then fetch from firestore
		  if (cachedTables.findIndex((t: any) => t.path === tablePath) === -1) {
			// var tableDoc = await firestore.doc(tablePath).get();
			var tableDoc:any = await getDoc(doc(firestore, tablePath));
			cachedTables.push({
			  path: tablePath,
			  tableDoc: tableDoc,
			});
		  } else {
			var tableDoc = cachedTables.find(
			  (t: any) => t.path === tablePath,
			).tableDoc;
		  }
		  // console.log('Table doc', tableDoc.data(), 'path', tablePath);
		  if (tableDoc.exists) {
			analyticsData.salesChannels.all.billWiseSales.tableWise.push({
			  table: tableDoc.data()['name'],
			  tableId: currentBill.table,
			  bills: [
				{
				  billId: billDoc.id,
				  billRef: billDoc.ref,
				  time: currentBill.createdDate,
				  totalSales: isValidNumber(currentBill.billing.grandTotal),
				},
			  ],
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			  totalBills: 1,
			});
		  }
		} else {
		  analyticsData.salesChannels.all.billWiseSales.tableWise[
			tableIndex
		  ].bills.push({
			billId: billDoc.id,
			billRef: billDoc.ref,
			time: currentBill.createdDate,
			totalSales: isValidNumber(currentBill.billing.grandTotal),
		  });
		  analyticsData.salesChannels.all.billWiseSales.tableWise[
			tableIndex
		  ].totalSales += isValidNumber(currentBill.billing.grandTotal);
		  analyticsData.salesChannels.all.billWiseSales.tableWise[
			tableIndex
		  ].totalBills += 1;
		}
		console.log("Tablewise analytics done for all");
		// analyticsData.salesChannels.all.billWiseSales.time
		// find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
		let timeIndex =
		  analyticsData.salesChannels.all.billWiseSales.time.findIndex(
			(t) => t.time === currentBill.createdDate.toDate().getHours(),
		  );
		if (timeIndex === -1) {
		  analyticsData.salesChannels.all.billWiseSales.time.push({
			time: currentBill.createdDate.toDate().getHours(),
			bills: [
			  {
				billId: billDoc.id,
				billRef: billDoc.ref,
				time: currentBill.createdDate,
				totalSales: isValidNumber(currentBill.billing.grandTotal),
			  },
			],
			timeNumber: Number(currentBill.createdDate.toDate().getHours()),
			totalSales: isValidNumber(currentBill.billing.grandTotal),
			totalBills: 1,
		  });
		} else {
		  analyticsData.salesChannels.all.billWiseSales.time[timeIndex].bills.push({
			billId: billDoc.id,
			billRef: billDoc.ref,
			time: currentBill.createdDate,
			totalSales: isValidNumber(currentBill.billing.grandTotal),
		  });
		  analyticsData.salesChannels.all.billWiseSales.time[
			timeIndex
		  ].totalSales += isValidNumber(currentBill.billing.grandTotal);
		  analyticsData.salesChannels.all.billWiseSales.time[
			timeIndex
		  ].totalBills += 1;
		}
		let items = currentBill.kots
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
			  category: item.category || '',
			  id: item.id || '',
			});
			analyticsData.salesChannels.all.itemWiseSales.byQuantity.push({
			  name: item.name,
			  quantity: item.quantity,
			  price: item.price,
			  category: item.category || '',
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
			].price += item.quantity * item.price;
		  }
		  if (currentBill.mode == 'dineIn') {
			let itemIndex =
			  analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.findIndex(
				(i) => i.id === item.id,
			  );
			if (itemIndex === -1) {
			  analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.push({
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				category: item.category || '',
				id: item.id || '',
			  });
			  analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity.push({
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				category: item.category || '',
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
			  ].price += item.quantity * item.price;
			}
		  } else if (currentBill.mode == 'takeaway') {
			let itemIndex =
			  analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.findIndex(
				(i) => i.id === item.id,
			  );
			if (itemIndex === -1) {
			  analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.push({
				name: item.name,
				quantity: isValidNumber(item.quantity),
				price: isValidNumber(item.price),
				category: item.category || '',
				id: item.id || '',
			  });
			  analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity.push({
				name: item.name,
				quantity: isValidNumber(item.quantity),
				price: isValidNumber(item.price),
				category: item.category || '',
				id: item.id || '',
			  });
			} else {
			  analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[
				itemIndex
			  ].quantity += isValidNumber(item.quantity);
			  analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[
				itemIndex
			  ].price += isValidNumber(item.quantity * item.price);
			  analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[
				itemIndex
			  ].quantity += isValidNumber(item.quantity);
			  analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[
				itemIndex
			  ].price += isValidNumber(item.quantity * item.price);
			}
		  } else if (currentBill.mode == 'online') {
			let itemIndex =
			  analyticsData.salesChannels.online.itemWiseSales.byPrice.findIndex(
				(i) => i.id === item.id,
			  );
			if (itemIndex === -1) {
			  analyticsData.salesChannels.online.itemWiseSales.byPrice.push({
				name: item.name,
				quantity: isValidNumber(item.quantity),
				price: isValidNumber(item.price),
				category: item.category || '',
				id: item.id || '',
			  });
			  analyticsData.salesChannels.online.itemWiseSales.byQuantity.push({
				name: item.name,
				quantity: isValidNumber(item.quantity),
				price: isValidNumber(item.price),
				category: item.category || '',
				id: item.id || '',
			  });
			} else {
			  analyticsData.salesChannels.online.itemWiseSales.byPrice[
				itemIndex
			  ].quantity += isValidNumber(item.quantity);
			  analyticsData.salesChannels.online.itemWiseSales.byPrice[
				itemIndex
			  ].price += isValidNumber(item.quantity * item.price);
			  analyticsData.salesChannels.online.itemWiseSales.byQuantity[
				itemIndex
			  ].quantity += isValidNumber(item.quantity);
			  analyticsData.salesChannels.online.itemWiseSales.byQuantity[
				itemIndex
			  ].price += isValidNumber(item.quantity * item.price);
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
		if (analyticsData.salesChannels.all.itemWiseSales.byPrice[0]) {
		  analyticsData.salesChannels.all.itemWiseSales.priceTopCategory =
			analyticsData.salesChannels.all.itemWiseSales.byPrice[0].category;
		}
		if (analyticsData.salesChannels.all.itemWiseSales.byQuantity[0]) {
		  analyticsData.salesChannels.all.itemWiseSales.quantityTopCategory =
			analyticsData.salesChannels.all.itemWiseSales.byQuantity[0].category;
		}
		console.log("Itemwise analytics done for all");
		// suspicious activities
		let activitiesList: {
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
		  // console.log('Activity:', activity.activity.user);
		  let userIndex = analyticsData.salesChannels.all.userWiseActions.findIndex(
			(u) => u.userId === activity.activity.user,
		  );
		  const KOT_ACTIVITY = [
			'newKot',
			'kotPrinted',
			'kotEdited',
			'kotCancelled',
			'lineCancelled',
		  ];
		  const BILL_ACTIVITY = [
			'billPrinted',
			'billEdited',
			'billCancelled',
			'billSplit',
			'customerDetailEntered',
			'billNormal',
			'billFinalized',
			'instructionSet',
			'billReactivated',
		  ];
		  const DISCOUNT_ACTIVITY = ['billDiscounted', 'lineDiscounted'];
		  const SETTLE_ACTIVITY = ['billSettled'];
		  const NC_ACTIVITY = ['billNC'];
		  if (userIndex === -1) {
			analyticsData.salesChannels.all.userWiseActions.push({
			  userId: activity.activity.user,
			  userRef: null,
			  actions: {
				bills: BILL_ACTIVITY.includes(activity.activity.type)
				  ? [activity]
				  : [],
				kots: KOT_ACTIVITY.includes(activity.activity.type)
				  ? [activity]
				  : [],
				discounts: DISCOUNT_ACTIVITY.includes(activity.activity.type)
				  ? [activity]
				  : [],
				settlements: SETTLE_ACTIVITY.includes(activity.activity.type)
				  ? [activity]
				  : [],
				ncs: NC_ACTIVITY.includes(activity.activity.type) ? [activity] : [],
			  },
			});
		  } else {
			if (BILL_ACTIVITY.includes(activity.activity.type)) {
			  analyticsData.salesChannels.all.userWiseActions[
				userIndex
			  ].actions.bills.push(activity);
			} else if (KOT_ACTIVITY.includes(activity.activity.type)) {
			  analyticsData.salesChannels.all.userWiseActions[
				userIndex
			  ].actions.kots.push(activity);
			} else if (DISCOUNT_ACTIVITY.includes(activity.activity.type)) {
			  analyticsData.salesChannels.all.userWiseActions[
				userIndex
			  ].actions.discounts.push(activity);
			} else if (SETTLE_ACTIVITY.includes(activity.activity.type)) {
			  analyticsData.salesChannels.all.userWiseActions[
				userIndex
			  ].actions.settlements.push(activity);
			} else if (NC_ACTIVITY.includes(activity.activity.type)) {
			  analyticsData.salesChannels.all.userWiseActions[
				userIndex
			  ].actions.ncs.push(activity);
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
			console.log(
			  'Adding activity',
			  activity.activity.type,
			  'to suspicious activities',
			  currentBill.mode,
			);
	
			analyticsData.salesChannels.all.suspiciousActivities.push(activity);
			if (currentBill.mode === 'dineIn') {
			  analyticsData.salesChannels.dineIn.suspiciousActivities.push(
				activity,
			  );
			} else if (currentBill.mode === 'takeaway') {
			  analyticsData.salesChannels.takeaway.suspiciousActivities.push(
				activity,
			  );
			} else if (currentBill.mode === 'online') {
			  analyticsData.salesChannels.online.suspiciousActivities.push(
				activity,
			  );
			}
		  }
		});
		// generate suspicious activities by categorizing them into bills, kots, discounts
		// analyticsData.salesChannels.all.userWiseActions
		// for dineIn
		console.log('currentBill.mode', currentBill.mode);
		if (currentBill.mode === 'dineIn') {
		  console.log('Adding dineIn bill',currentBill?.billing?.grandTotal);
		  
		  if (currentBill?.settlement?.time) {
			analyticsData.salesChannels.dineIn.totalSettledBills += 1;
		  } else {
			analyticsData.salesChannels.dineIn.totalUnsettledBills += 1;
		  }
		  if (currentBill?.billing?.discount?.length > 0) {
			analyticsData.salesChannels.dineIn.totalDiscountedBills += 1;
		  }
		  if (currentBill?.nonChargeableDetail) {
			analyticsData.salesChannels.dineIn.totalNcBills += 1;
		  }
		  analyticsData.salesChannels.dineIn.totalSales += isValidNumber(
			currentBill.billing.grandTotal,
		  );
		  analyticsData.salesChannels.dineIn.netSales += isValidNumber(
			currentBill.billing.grandTotal -
			  currentBill.billing.discount.reduce(
				(total: number, d: any) => d.totalAppliedDiscount + total,
				0,
			  ),
		  );
		  analyticsData.salesChannels.dineIn.totalDiscount += isValidNumber(
			currentBill.billing.discount.reduce(
			  (total: number, d: any) => d.totalAppliedDiscount + total,
			  0,
			),
		  );
		  if (currentBill.nonChargeableDetail) {
			analyticsData.salesChannels.dineIn.totalNC += isValidNumber(
			  currentBill.billing.subTotal,
			);
		  }
		  analyticsData.salesChannels.dineIn.totalTaxes += isValidNumber(
			currentBill.billing.taxes.reduce(
			  (total: number, t: any) => t.amount + total,
			  0,
			),
		  );
		  analyticsData.salesChannels.dineIn.hourlySales[
			currentBill.createdDate.toDate().getHours()
		  ] += isValidNumber(currentBill.billing.grandTotal);
		  analyticsData.salesChannels.dineIn.billWiseSales.rangeWise[
			currentBill.billing.grandTotal < 500
			  ? 'lowRange'
			  : currentBill.billing.grandTotal < 1000
			  ? 'mediumRange'
			  : 'highRange'
		  ].bills.push({
			billId: billDoc.id,
			billRef: billDoc.ref,
			time: currentBill.createdDate,
			totalSales: isValidNumber(currentBill.billing.grandTotal),
		  });
		  if (currentBill.settlement?.payments) {
			currentBill.settlement?.payments.forEach((payment: any) => {
			  if (
				!analyticsData.salesChannels.dineIn.paymentReceived[
				  payment.paymentMethod
				]
			  ) {
				analyticsData.salesChannels.dineIn.paymentReceived[
				  payment.paymentMethod
				] = 0;
			  }
			  analyticsData.salesChannels.dineIn.paymentReceived[
				payment.paymentMethod
			  ] += isValidNumber(payment.amount);
			});
		  }
		  // analyticsData.salesChannels.dineIn.billWiseSales.tableWise
		  // find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
		  let tableIndex =
			analyticsData.salesChannels.dineIn.billWiseSales.tableWise.findIndex(
			  (t: any) => t.tableId == currentBill.table,
			);
		  if (tableIndex === -1) {
			let tablePath = `business/${businessDoc.id}/tables/${currentBill.table}`;
			// console.log('Table path', tablePath);
			// find tablePath in cachedTables if not found then fetch from firestore
			if (cachedTables.findIndex((t: any) => t.path === tablePath) === -1) {
			//   var tableDoc = await firestore.doc(tablePath).get();
			  var tableDoc:any = await getDoc(doc(firestore, tablePath));
			  cachedTables.push({
				path: tablePath,
				tableDoc: tableDoc,
			  });
			} else {
			  var tableDoc = cachedTables.find(
				(t: any) => t.path === tablePath,
			  ).tableDoc;
			}
			if (tableDoc.data() == undefined) {
			  return;
			}
			// console.log('Table doc', tableDoc.data(), 'path', tablePath);
			if (tableDoc.exists) {
			  analyticsData.salesChannels.dineIn.billWiseSales.tableWise.push({
				table: tableDoc.data()['name'],
				tableId: currentBill.table,
				bills: [
				  {
					billId: billDoc.id,
					billRef: billDoc.ref,
					time: currentBill.createdDate,
					totalSales: isValidNumber(currentBill.billing.grandTotal),
				  },
				],
				totalSales: isValidNumber(currentBill.billing.grandTotal),
				totalBills: 1,
			  });
			}
		  } else {
			analyticsData.salesChannels.dineIn.billWiseSales.tableWise[
			  tableIndex
			].bills.push({
			  billId: billDoc.id,
			  billRef: billDoc.ref,
			  time: currentBill.createdDate,
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			});
			analyticsData.salesChannels.dineIn.billWiseSales.tableWise[
			  tableIndex
			].totalSales += isValidNumber(currentBill.billing.grandTotal);
			analyticsData.salesChannels.dineIn.billWiseSales.tableWise[
			  tableIndex
			].totalBills += 1;
		  }
		  // analyticsData.salesChannels.dineIn.billWiseSales.time
		  // find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
		  let timeIndex =
			analyticsData.salesChannels.dineIn.billWiseSales.time.findIndex(
			  (t) => t.time === currentBill.createdDate.toDate().getHours(),
			);
		  if (timeIndex === -1) {
			analyticsData.salesChannels.dineIn.billWiseSales.time.push({
			  time: currentBill.createdDate.toDate().getHours(),
			  bills: [
				{
				  billId: billDoc.id,
				  billRef: billDoc.ref,
				  time: currentBill.createdDate,
				  totalSales: isValidNumber(currentBill.billing.grandTotal),
				},
			  ],
			  timeNumber: Number(currentBill.createdDate.toDate().getHours()),
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			  totalBills: 1,
			});
		  } else {
			analyticsData.salesChannels.dineIn.billWiseSales.time[
			  timeIndex
			].bills.push({
			  billId: billDoc.id,
			  billRef: billDoc.ref,
			  time: currentBill.createdDate,
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			});
			analyticsData.salesChannels.dineIn.billWiseSales.time[
			  timeIndex
			].totalSales += isValidNumber(currentBill.billing.grandTotal);
			analyticsData.salesChannels.dineIn.billWiseSales.time[
			  timeIndex
			].totalBills += 1;
		  }
		} else if (currentBill.mode === 'takeaway') {
		  console.log('Mode takeaway found', currentBill?.billing?.grandTotal);
		  if (currentBill?.settlement?.time) {
			analyticsData.salesChannels.takeaway.totalSettledBills += 1;
		  } else {
			analyticsData.salesChannels.takeaway.totalUnsettledBills += 1;
		  }
		  if (currentBill?.billing?.discount?.length > 0) {
			analyticsData.salesChannels.takeaway.totalDiscountedBills += 1;
		  }
		  if (currentBill?.nonChargeableDetail) {
			analyticsData.salesChannels.takeaway.totalNcBills += 1;
		  }
		  analyticsData.salesChannels.takeaway.totalSales += isValidNumber(
			currentBill.billing.grandTotal,
		  );
		  analyticsData.salesChannels.takeaway.netSales += isValidNumber(
			currentBill.billing.grandTotal -
			  currentBill.billing.discount.reduce(
				(total: number, d: any) => d.totalAppliedDiscount + total,
				0,
			  ),
		  );
		  analyticsData.salesChannels.takeaway.totalDiscount += isValidNumber(
			currentBill.billing.discount.reduce(
			  (total: number, d: any) => d.totalAppliedDiscount + total,
			  0,
			),
		  );
		  if (currentBill.nonChargeableDetail) {
			analyticsData.salesChannels.takeaway.totalNC += isValidNumber(
			  currentBill.billing.subTotal,
			);
		  }
		  analyticsData.salesChannels.takeaway.totalTaxes += isValidNumber(
			currentBill.billing.taxes.reduce(
			  (total: number, t: any) => t.amount + total,
			  0,
			),
		  );
		  analyticsData.salesChannels.takeaway.hourlySales[
			currentBill.createdDate.toDate().getHours()
		  ] += isValidNumber(currentBill.billing.grandTotal);
		  analyticsData.salesChannels.takeaway.billWiseSales.rangeWise[
			currentBill.billing.grandTotal < 500
			  ? 'lowRange'
			  : currentBill.billing.grandTotal < 1000
			  ? 'mediumRange'
			  : 'highRange'
		  ].bills.push({
			billId: billDoc.id,
			billRef: billDoc.ref,
			time: currentBill.createdDate,
			totalSales: isValidNumber(currentBill.billing.grandTotal),
		  });
		  if (currentBill.settlement?.payments) {
			currentBill.settlement?.payments.forEach((payment: any) => {
			  if (
				!analyticsData.salesChannels.takeaway.paymentReceived[
				  payment.paymentMethod
				]
			  ) {
				analyticsData.salesChannels.takeaway.paymentReceived[
				  payment.paymentMethod
				] = 0;
			  }
			  analyticsData.salesChannels.takeaway.paymentReceived[
				payment.paymentMethod
			  ] += isValidNumber(payment.amount);
			});
		  }
		  // analyticsData.salesChannels.takeaway.billWiseSales.tableWise
		  // find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
		  let tableIndex =
			analyticsData.salesChannels.takeaway.billWiseSales.tableWise.findIndex(
			  (t: any) => t.tableId == currentBill.table,
			);
		  if (tableIndex === -1) {
			let tablePath = `business/${businessDoc.id}/tables/${currentBill.table}`;
			// console.log('Table path', tablePath);
			// find tablePath in cachedTables if not found then fetch from firestore
			if (cachedTables.findIndex((t: any) => t.path === tablePath) === -1) {
			//   var tableDoc = await firestore.doc(tablePath).get();
			  var tableDoc:any = await getDoc(doc(firestore, tablePath));
			  cachedTables.push({
				path: tablePath,
				tableDoc: tableDoc,
			  });
			} else {
			  var tableDoc = cachedTables.find(
				(t: any) => t.path === tablePath,
			  ).tableDoc;
			}
			if (tableDoc.data() == undefined) {
			  return;
			}
			// console.log('Table doc', tableDoc.data(), 'path', tablePath);
			if (tableDoc.exists) {
			  analyticsData.salesChannels.takeaway.billWiseSales.tableWise.push({
				table: tableDoc.data()['name'],
				tableId: currentBill.table,
				bills: [
				  {
					billId: billDoc.id,
					billRef: billDoc.ref,
					time: currentBill.createdDate,
					totalSales: isValidNumber(currentBill.billing.grandTotal),
				  },
				],
				totalSales: isValidNumber(currentBill.billing.grandTotal),
				totalBills: 1,
			  });
			}
		  } else {
			analyticsData.salesChannels.takeaway.billWiseSales.tableWise[
			  tableIndex
			].bills.push({
			  billId: billDoc.id,
			  billRef: billDoc.ref,
			  time: currentBill.createdDate,
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			});
			analyticsData.salesChannels.takeaway.billWiseSales.tableWise[
			  tableIndex
			].totalSales += isValidNumber(currentBill.billing.grandTotal);
			analyticsData.salesChannels.takeaway.billWiseSales.tableWise[
			  tableIndex
			].totalBills += 1;
		  }
		  // analyticsData.salesChannels.takeaway.billWiseSales.time
		  // find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
		  let timeIndex =
			analyticsData.salesChannels.takeaway.billWiseSales.time.findIndex(
			  (t) => t.time === currentBill.createdDate.toDate().getHours(),
			);
		  if (timeIndex === -1) {
			analyticsData.salesChannels.takeaway.billWiseSales.time.push({
			  time: currentBill.createdDate.toDate().getHours(),
			  bills: [
				{
				  billId: billDoc.id,
				  billRef: billDoc.ref,
				  time: currentBill.createdDate,
				  totalSales: isValidNumber(currentBill.billing.grandTotal),
				},
			  ],
			  timeNumber: Number(currentBill.createdDate.toDate().getHours()),
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			  totalBills: 1,
			});
		  } else {
			analyticsData.salesChannels.takeaway.billWiseSales.time[
			  timeIndex
			].bills.push({
			  billId: billDoc.id,
			  billRef: billDoc.ref,
			  time: currentBill.createdDate,
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			});
			analyticsData.salesChannels.takeaway.billWiseSales.time[
			  timeIndex
			].totalSales += isValidNumber(currentBill.billing.grandTotal);
			analyticsData.salesChannels.takeaway.billWiseSales.time[
			  timeIndex
			].totalBills += 1;
		  }
		} else if (currentBill.mode === 'online') {
		  try {
			console.log('Mode online found', currentBill?.billing?.grandTotal);
			if (currentBill?.settlement?.time) {
			  analyticsData.salesChannels.online.totalSettledBills += 1;
			} else {
			  analyticsData.salesChannels.online.totalUnsettledBills += 1;
			}
			if (currentBill?.billing?.discount?.length > 0) {
			  analyticsData.salesChannels.online.totalDiscountedBills += 1;
			}
			if (currentBill?.nonChargeableDetail) {
			  analyticsData.salesChannels.online.totalNcBills += 1;
			}
			analyticsData.salesChannels.online.totalSales += isValidNumber(
			  currentBill.billing.grandTotal,
			);
			analyticsData.salesChannels.online.netSales += isValidNumber(
			  isValidNumber(currentBill.billing.grandTotal) -
				currentBill.billing.discount.reduce(
				  (total: number, d: any) => d.totalAppliedDiscount + total,
				  0,
				),
			);
			analyticsData.salesChannels.online.totalDiscount += isValidNumber(
			  currentBill.billing.discount.reduce(
				(total: number, d: any) => d.totalAppliedDiscount + total,
				0,
			  ),
			);
			if (currentBill.nonChargeableDetail) {
			  analyticsData.salesChannels.online.totalNC += isValidNumber(
				currentBill.billing.subTotal,
			  );
			}
			analyticsData.salesChannels.online.totalTaxes += isValidNumber(
			  currentBill.billing.taxes.reduce(
				(total: number, t: any) => t.amount + total,
				0,
			  ),
			);
			analyticsData.salesChannels.online.hourlySales[
			  currentBill.createdDate.toDate().getHours()
			] += isValidNumber(currentBill.billing.grandTotal);
			analyticsData.salesChannels.online.billWiseSales.rangeWise[
			  isValidNumber(currentBill.billing.grandTotal) < 500
				? 'lowRange'
				: isValidNumber(currentBill.billing.grandTotal) < 1000
				? 'mediumRange'
				: 'highRange'
			].bills.push({
			  billId: billDoc.id,
			  billRef: billDoc.ref,
			  time: currentBill.createdDate,
			  totalSales: isValidNumber(currentBill.billing.grandTotal),
			});
			if (currentBill.settlement?.payments) {
			  currentBill.settlement?.payments.forEach((payment: any) => {
				if (
				  !analyticsData.salesChannels.online.paymentReceived[
					payment.paymentMethod
				  ]
				) {
				  analyticsData.salesChannels.online.paymentReceived[
					payment.paymentMethod
				  ] = 0;
				}
				analyticsData.salesChannels.online.paymentReceived[
				  payment.paymentMethod
				] += isValidNumber(payment.amount);
			  });
			}
			console.log("Stage 1");
			// analyticsData.salesChannels.online.billWiseSales.tableWise
			// find if existing entry for a table exists in tableWise if yes then add the sales and increase the bill number
			let tableIndex =
			  analyticsData.salesChannels.online.billWiseSales.tableWise.findIndex(
				(t: any) => t.tableId == currentBill.table,
			  );
			if (tableIndex === -1) {
			  let tablePath = `business/${businessDoc.id}/tables/${currentBill.table}`;
			  // console.log('Table path', tablePath);
			  // find tablePath in cachedTables if not found then fetch from firestore
			  if (cachedTables.findIndex((t: any) => t.path === tablePath) === -1) {
				// var tableDoc = await firestore.doc(tablePath).get();
				var tableDoc:any = await getDoc(doc(firestore, tablePath));
				cachedTables.push({
				  path: tablePath,
				  tableDoc: tableDoc,
				});
			  } else {
				var tableDoc = cachedTables.find(
				  (t: any) => t.path === tablePath,
				).tableDoc;
			  }
			  if (tableDoc.data() == undefined) {
				return;
			  }
			  // console.log('Table doc', tableDoc.data(), 'path', tablePath);
			  if (tableDoc.exists) {
				analyticsData.salesChannels.online.billWiseSales.tableWise.push({
				  table: tableDoc.data()['name'],
				  tableId: currentBill.table,
				  bills: [
					{
					  billId: billDoc.id,
					  billRef: billDoc.ref,
					  time: currentBill.createdDate,
					  totalSales: isValidNumber(currentBill.billing.grandTotal),
					},
				  ],
				  totalSales: isValidNumber(currentBill.billing.grandTotal),
				  totalBills: 1,
				});
			  }
			} else {
			  analyticsData.salesChannels.online.billWiseSales.tableWise[
				tableIndex
			  ].bills.push({
				billId: billDoc.id,
				billRef: billDoc.ref,
				time: currentBill.createdDate,
				totalSales: isValidNumber(currentBill.billing.grandTotal),
			  });
			  analyticsData.salesChannels.online.billWiseSales.tableWise[
				tableIndex
			  ].totalSales += isValidNumber(currentBill.billing.grandTotal);
			  analyticsData.salesChannels.online.billWiseSales.tableWise[
				tableIndex
			  ].totalBills += 1;
			}
			console.log("Stage 2");
			
			// analyticsData.salesChannels.online.billWiseSales.time
			// find if existing entry for a time exists in timeWise if yes then add the sales and increase the bill number
			let timeIndex =
			  analyticsData.salesChannels.online.billWiseSales.time.findIndex(
				(t) => t.time === currentBill.createdDate.toDate().getHours(),
			  );
			if (timeIndex === -1) {
			  analyticsData.salesChannels.online.billWiseSales.time.push({
				time: currentBill.createdDate.toDate().getHours(),
				bills: [
				  {
					billId: billDoc.id,
					billRef: billDoc.ref,
					time: currentBill.createdDate,
					totalSales: isValidNumber(currentBill.billing.grandTotal),
				  },
				],
				timeNumber: Number(currentBill.createdDate.toDate().getHours()),
				totalSales: isValidNumber(currentBill.billing.grandTotal),
				totalBills: 1,
			  });
			} else {
			  analyticsData.salesChannels.online.billWiseSales.time[
				timeIndex
			  ].bills.push({
				billId: billDoc.id,
				billRef: billDoc.ref,
				time: currentBill.createdDate,
				totalSales: isValidNumber(currentBill.billing.grandTotal),
			  });
			  analyticsData.salesChannels.online.billWiseSales.time[
				timeIndex
			  ].totalSales += isValidNumber(currentBill.billing.grandTotal);
			  analyticsData.salesChannels.online.billWiseSales.time[
				timeIndex
			  ].totalBills += 1;
			}
			console.log("Stage 3");
		  } catch (error) {
			console.log("Error in online",error);
		  }
		}
		console.log("Ran for ",billDoc.id);
	  }
	} catch (error) {
	  console.log('Error in bill', error);
	}
	let filteredTables: any[] = [];
	analyticsData.salesChannels.all.billWiseSales.tableWise.forEach((table) => {
	  // find table in filteredTables
	  let tableIndex = filteredTables.findIndex(
		(t) => t.tableId === table.tableId,
	  );
	  if (tableIndex === -1) {
		filteredTables.push(table);
	  } else {
		filteredTables[tableIndex].totalSales += table.totalSales;
		filteredTables[tableIndex].totalBills += table.totalBills;
		table.bills.forEach((bill) => {
		  filteredTables[tableIndex].bills.push(bill);
		});
	  }
	});
	// sort by tableName
	filteredTables.sort((a, b) => a.table.localeCompare(b.table));
	analyticsData.salesChannels.all.billWiseSales.tableWise = filteredTables;
	// set max tables by finding maximum number of bills in a table
	analyticsData.salesChannels.all.billWiseSales.maxTables =
	  analyticsData.salesChannels.all.billWiseSales.tableWise.reduce(
		(max: number, table: any) =>
		  table.totalBills > max ? table.totalBills : max,
		0,
	  );
	filteredTables = [];
	analyticsData.salesChannels.dineIn.billWiseSales.tableWise.forEach(
	  (table) => {
		// find table in filteredTables
		let tableIndex = filteredTables.findIndex(
		  (t) => t.tableId === table.tableId,
		);
		if (tableIndex === -1) {
		  filteredTables.push(table);
		} else {
		  filteredTables[tableIndex].totalSales += table.totalSales;
		  filteredTables[tableIndex].totalBills += table.totalBills;
		  table.bills.forEach((bill) => {
			filteredTables[tableIndex].bills.push(bill);
		  });
		}
	  },
	);
	// sort by tableName
	filteredTables.sort((a, b) => a.table.localeCompare(b.table));
	analyticsData.salesChannels.dineIn.billWiseSales.tableWise = filteredTables;
	analyticsData.salesChannels.dineIn.billWiseSales.maxTables =
	  analyticsData.salesChannels.dineIn.billWiseSales.tableWise.reduce(
		(max: number, table: any) =>
		  table.totalBills > max ? table.totalBills : max,
		0,
	  );
	filteredTables = [];
	analyticsData.salesChannels.takeaway.billWiseSales.tableWise.forEach(
	  (table) => {
		// find table in filteredTables
		let tableIndex = filteredTables.findIndex(
		  (t) => t.tableId === table.tableId,
		);
		if (tableIndex === -1) {
		  filteredTables.push(table);
		} else {
		  filteredTables[tableIndex].totalSales += isValidNumber(
			table.totalSales,
		  );
		  filteredTables[tableIndex].totalBills += isValidNumber(
			table.totalBills,
		  );
		  table.bills.forEach((bill) => {
			filteredTables[tableIndex].bills.push(bill);
		  });
		}
	  },
	);
	// sort by tableName
	filteredTables.sort((a, b) => a.table.localeCompare(b.table));
	analyticsData.salesChannels.takeaway.billWiseSales.tableWise = filteredTables;
	analyticsData.salesChannels.takeaway.billWiseSales.maxTables =
	  analyticsData.salesChannels.takeaway.billWiseSales.tableWise.reduce(
		(max: number, table: any) =>
		  table.totalBills > max ? table.totalBills : max,
		0,
	  );
	filteredTables = [];
	analyticsData.salesChannels.online.billWiseSales.tableWise.forEach(
	  (table) => {
		// find table in filteredTables
		let tableIndex = filteredTables.findIndex(
		  (t) => t.tableId === table.tableId,
		);
		if (tableIndex === -1) {
		  filteredTables.push(table);
		} else {
		  filteredTables[tableIndex].totalSales += isValidNumber(
			table.totalSales,
		  );
		  filteredTables[tableIndex].totalBills += isValidNumber(
			table.totalBills,
		  );
		  table.bills.forEach((bill) => {
			filteredTables[tableIndex].bills.push(bill);
		  });
		}
	  },
	);
	// sort by tableName
	filteredTables.sort((a, b) => a.table.localeCompare(b.table));
	analyticsData.salesChannels.online.billWiseSales.tableWise = filteredTables;
	analyticsData.salesChannels.online.billWiseSales.maxTables =
	  analyticsData.salesChannels.online.billWiseSales.tableWise.reduce(
		(max: number, table: any) =>
		  table.totalBills > max ? table.totalBills : max,
		0,
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
	  (a, b) =>
		a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
	);
	// sort itemWiseSales by price
	analyticsData.salesChannels.all.itemWiseSales.byPrice.sort(
	  (a, b) => b.price - a.price,
	);
	// sort itemWiseSales by quantity
	analyticsData.salesChannels.all.itemWiseSales.byQuantity.sort(
	  (a, b) => b.quantity - a.quantity,
	);
	// for dineIn
	if (analyticsData.salesChannels.all.itemWiseSales.byPrice[0]) {
	  analyticsData.salesChannels.all.itemWiseSales.byPriceMax =
		analyticsData.salesChannels.all.itemWiseSales.byPrice[0].price;
	  analyticsData.salesChannels.all.itemWiseSales.priceTopCategory =
		analyticsData.salesChannels.all.itemWiseSales.byPrice[0].category;
	}
	if (analyticsData.salesChannels.all.itemWiseSales.byQuantity[0]) {
	  analyticsData.salesChannels.all.itemWiseSales.byQuantityMax =
		analyticsData.salesChannels.all.itemWiseSales.byQuantity[0].quantity;
	  analyticsData.salesChannels.all.itemWiseSales.quantityTopCategory =
		analyticsData.salesChannels.all.itemWiseSales.byQuantity[0].category;
	}
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
	  (a, b) =>
		a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
	);
	// sort itemWiseSales by price
	analyticsData.salesChannels.dineIn.itemWiseSales.byPrice.sort(
	  (a, b) => b.price - a.price,
	);
	// sort itemWiseSales by quantity
	analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity.sort(
	  (a, b) => b.quantity - a.quantity,
	);
	if (analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[0]) {
	  analyticsData.salesChannels.dineIn.itemWiseSales.byPriceMax =
		analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[0].price;
	  analyticsData.salesChannels.dineIn.itemWiseSales.priceTopCategory =
		analyticsData.salesChannels.dineIn.itemWiseSales.byPrice[0].category;
	}
	if (analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[0]) {
	  analyticsData.salesChannels.dineIn.itemWiseSales.byQuantityMax =
		analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[0].quantity;
	  analyticsData.salesChannels.dineIn.itemWiseSales.quantityTopCategory =
		analyticsData.salesChannels.dineIn.itemWiseSales.byQuantity[0].category;
	}
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
	  (a, b) =>
		a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
	);
	// sort itemWiseSales by price
	analyticsData.salesChannels.takeaway.itemWiseSales.byPrice.sort(
	  (a, b) => b.price - a.price,
	);
	// sort itemWiseSales by quantity
	analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity.sort(
	  (a, b) => b.quantity - a.quantity,
	);
	if (analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[0]) {
	  analyticsData.salesChannels.takeaway.itemWiseSales.byPriceMax =
		analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[0].price;
	  analyticsData.salesChannels.takeaway.itemWiseSales.priceTopCategory =
		analyticsData.salesChannels.takeaway.itemWiseSales.byPrice[0].category;
	}
	if (analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[0]) {
	  analyticsData.salesChannels.takeaway.itemWiseSales.byQuantityMax =
		analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[0].quantity;
	  analyticsData.salesChannels.takeaway.itemWiseSales.quantityTopCategory =
		analyticsData.salesChannels.takeaway.itemWiseSales.byQuantity[0].category;
	}
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
	  (a, b) =>
		a.createdDate.toDate().getTime() - b.createdDate.toDate().getTime(),
	);
	// sort itemWiseSales by price
	analyticsData.salesChannels.online.itemWiseSales.byPrice.sort(
	  (a, b) => b.price - a.price,
	);
	// sort itemWiseSales by quantity
	analyticsData.salesChannels.online.itemWiseSales.byQuantity.sort(
	  (a, b) => b.quantity - a.quantity,
	);
	if (analyticsData.salesChannels.online.itemWiseSales.byPrice[0]) {
	  analyticsData.salesChannels.online.itemWiseSales.byPriceMax =
		analyticsData.salesChannels.online.itemWiseSales.byPrice[0].price;
	  analyticsData.salesChannels.online.itemWiseSales.priceTopCategory =
		analyticsData.salesChannels.online.itemWiseSales.byPrice[0].category;
	}
	if (analyticsData.salesChannels.online.itemWiseSales.byQuantity[0]) {
	  analyticsData.salesChannels.online.itemWiseSales.byQuantityMax =
		analyticsData.salesChannels.online.itemWiseSales.byQuantity[0].quantity;
	  analyticsData.salesChannels.online.itemWiseSales.quantityTopCategory =
		analyticsData.salesChannels.online.itemWiseSales.byQuantity[0].category;
	}
	let userActions = analyticsData.salesChannels.all.userWiseActions.filter(
	  (action) => {
		return action.userId;
	  },
	);
	analyticsData.salesChannels.all.userWiseActions = userActions;
	userActions = analyticsData.salesChannels.dineIn.userWiseActions.filter(
	  (action) => {
		return action.userId;
	  },
	);
	analyticsData.salesChannels.dineIn.userWiseActions = userActions;
	userActions = analyticsData.salesChannels.takeaway.userWiseActions.filter(
	  (action) => {
		return action.userId;
	  },
	);
	analyticsData.salesChannels.takeaway.userWiseActions = userActions;
	userActions = analyticsData.salesChannels.online.userWiseActions.filter(
	  (action) => {
		return action.userId;
	  },
	);
	analyticsData.salesChannels.online.userWiseActions = userActions;
	// add this analyticsData to business/id/analyticsData/2021/01/01
	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	// await firestore
	//   .doc(`business/${businessDoc.id}/analyticsData/${year}/${month}/${day}`)
	//   .set(analyticsData);
	// await firestore
	//   .doc(`business/${businessDoc.id}/analyticsData/${year}/${month}/${day}`)
	//   .set(analyticsData);
	await setDoc(doc(firestore,`business/${businessDoc.id}/analyticsData/${year}/${month}/${day}`),analyticsData);
	console.log('Analytics data', analyticsData);
  
	console.log(
	  'Size of analytics data in mb',
	  JSON.stringify(analyticsData).length / 1000000,
	);
	return {
	  ...analyticsData,
	  analyzedBills: billsDocs.docs.length,
	  addedPath: `business/${businessDoc.id}/analyticsData/${year}/${month}/${day}`,
	};
  }
  
  function isValidNumber(number: any) {
	// check if the number is valid number if not then return 0
	if (isNaN(number)) {
	  return 0;
	} else {
	  return number;
	}
  }
  const firestore = getFirestore(app);
  let businessRef = doc(firestore,`business/uqd9dm0its2v9xx6fey2q`);
  getDoc(businessRef).then((document: any) => {
    generateAnalytics(firestore, document).then((data: any) => {
      console.log('Generated Data', data);
    })
  });

  export interface AnalyticsData {
	salesChannels: {
	  all: ChannelWiseAnalyticsData;
	  dineIn: ChannelWiseAnalyticsData;
	  takeaway: ChannelWiseAnalyticsData;
	  online: ChannelWiseAnalyticsData;
	};
	customersData: {
	  totalCustomers: number;
	  totalCustomersByChannel: {
		dineIn: number;
		takeaway: number;
		online: number;
	  };
	  totalNewCustomers: number;
	  totalNewCustomersByChannel: {
		dineIn: number;
		takeaway: number;
		online: number;
	  };
	  newCustomers: {
		name: string;
		phone: string;
		joiningDate: Timestamp;
		email?: string;
		address?: string;
		loyaltyPoint: number;
	  }[];
	  allCustomers: {
		name: string;
		phone: string;
		joiningDate: Timestamp;
		email?: string;
		address?: string;
		loyaltyPoint: number;
	  }[];
	};
	createdAt: Timestamp;
	createdAtUTC: string;
  }
  
  export interface ChannelWiseAnalyticsData {
	totalSales: number;
	netSales: number;
	totalDiscount: number;
	totalNC: number;
	totalTaxes: number;
	hourlySales: number[];
	averageHourlySales: number[];
	totalSettledBills: number;
	totalUnsettledBills: number;
	totalDiscountedBills: number;
	totalNcBills: number;
	paymentReceived: {
	  [key: string]: number;
	};
	billWiseSales: {
	  rangeWise:{
		lowRange: {
		  bills: {
			billId: string;
			billRef: any;
			totalSales: number;
			time: Timestamp;
		  }[];
		  totalSales: number;
		};
		mediumRange: {
		  bills: {
			billId: string;
			billRef: any;
			totalSales: number;
			time: Timestamp;
		  }[];
		  totalSales: number;
		};
		highRange: {
		  bills: {
			billId: string;
			billRef: any;
			totalSales: number;
			time: Timestamp;
		  }[];
		  totalSales: number;
		}
	  },
	  tableWise:{
		table:string;
		tableId:string;
		totalSales:number;
		totalBills:number;
		bills:{
		  billId: string,
		  billRef: any,
		  time: any,
		  totalSales: number,
		}[]
	  }[],
	  maxTables:number;
	  time:{
		time:string;
		timeNumber:number;
		totalSales:number;
		totalBills:number;
		bills:{
		  billId: string,
		  billRef: any,
		  time: any,
		  totalSales: number,
		}[]
	  }[]
	};
	itemWiseSales: {
	  byPrice: {
		name: string;
		id: string;
		price: number;
		quantity: number;
		category: {
		  name: string;
		  id: string;
		};
	  }[];
	  byQuantity: {
		name: string;
		id: string;
		price: number;
		quantity: number;
		category: {
		  name: string;
		  id: string;
		};
	  }[];
	  priceTopCategory:any;
	  quantityTopCategory:any;
	  byPriceMax:number;
	  byQuantityMax:number;
	};
	suspiciousActivities: any[];
	userWiseActions: {
	  userId: string;
	  userRef: any;
	  actions: {
		bills:any[];
		kots:any[];
		discounts: any[];
		settlements: any[];
		ncs: any[];
	  };
	}[
	];
  }