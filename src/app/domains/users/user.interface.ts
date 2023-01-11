export interface User {
    id: number
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      role: "user" | "admin",
      phoneNumber: number,
      orders: [],
      moviesToWatch: [],
      ratedMovies: [],
      active: boolean,
      cart: Cart
}


interface Cart {
    tickets: [],
    price: number
}