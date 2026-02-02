const mockData = {
    flights: [
        { id: 'f1', from: 'DEL', to: 'BOM', airline: 'IndiGo', price: 4500, time: '08:30', duration: '2h 15m', seatsAvailable: 4, resale: true, resalePrice: 3200 },
        { id: 'f2', from: 'BLR', to: 'DEL', airline: 'Air India', price: 6200, time: '14:00', duration: '2h 45m', seatsAvailable: 2, resale: false },
        { id: 'f3', from: 'HYD', to: 'MAA', airline: 'Vistara', price: 5100, time: '19:15', duration: '1h 30m', seatsAvailable: 12, resale: true, resalePrice: 4000 }
    ],
    
    trains: [
        { id: 't1', name: 'Rajdhani Express', from: 'NDLS', to: 'MMCT', price: 2800, time: '16:25', duration: '15h 30m', class: '3A', seatsAvailable: 24, resale: true, resalePrice: 2000 },
        { id: 't2', name: 'Shatabdi Express', from: 'BPL', to: 'NDLS', price: 1500, time: '06:00', duration: '8h 00m', class: 'CC', seatsAvailable: 5, resale: false }
    ],
    
    buses: [
        { id: 'b1', operator: 'Volvo', from: 'Mumbai', to: 'Pune', price: 800, time: '22:00', duration: '3h 30m', type: 'Sleeper', seatsAvailable: 6, resale: true, resalePrice: 600 },
        { id: 'b2', operator: 'SRS Travels', from: 'Bangalore', to: 'Chennai', price: 1200, time: '21:30', duration: '6h 00m', type: 'AC Sleeper', seatsAvailable: 3, resale: false }
    ],
    
    ipl: [
        { id: 'ipl1', match: 'MI vs CSK', venue: 'Wankhede Stadium', date: '2024-04-15', price: 2500, category: 'VIP', seatsAvailable: 8, resale: true, resalePrice: 1800, image: 'mi-csk.jpg' },
        { id: 'ipl2', match: 'RCB vs KKR', venue: 'Chinnaswamy', date: '2024-04-20', price: 1800, category: 'Premium', seatsAvailable: 15, resale: false, image: 'rcb-kkr.jpg' },
        { id: 'ipl3', match: 'Final - TBD', venue: 'Narendra Modi Stadium', date: '2024-05-26', price: 5000, category: 'Corporate', seatsAvailable: 4, resale: true, resalePrice: 3500, image: 'final.jpg' }
    ],
    
    movies: [
        { id: 'm1', title: 'Dune: Part Two', cinema: 'PVR Phoenix', time: '19:30', price: 400, format: 'IMAX', seatsAvailable: 20, resale: true, resalePrice: 300 },
        { id: 'm2', title: 'Kalki 2898 AD', cinema: 'INOX', time: '20:15', price: 350, format: '3D', seatsAvailable: 12, resale: false }
    ],
    
    userTickets: [
        { id: 'ut1', type: 'flight', details: { from: 'DEL', to: 'BOM', date: '2024-04-10' }, price: 4500, listed: false },
        { id: 'ut2', type: 'ipl', details: { match: 'MI vs CSK', date: '2024-04-15' }, price: 2500, listed: true, listingPrice: 2000 }
    ]
};

const resaleListings = [
    { id: 'r1', type: 'flight', item: mockData.flights[0], seller: 'Rahul_S', discount: 28, expiry: '2h' },
    { id: 'r2', type: 'ipl', item: mockData.ipl[0], seller: 'CricketFan99', discount: 15, expiry: '5h' },
    { id: 'r3', type: 'train', item: mockData.trains[0], seller: 'Traveler_X', discount: 22, expiry: '12h' }
];