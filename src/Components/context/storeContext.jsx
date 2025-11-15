import { createContext, useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../../server.js";


// import { service_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({}); //manage cart
  const url = baseUrl;
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const [service_list, setServiceList] = useState([]);

  const clearCart = async () => {
    setCartItems({}); // Clear the cart on the frontend
    if (token) {
      await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } }); // Clear the cart on the backend
    }
  };

  const addToCart = async (itemId) => {
    //if user is adding the service first time entry will be created
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    //if user is removing the service first time entry will be deleted
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCartAmount = () => {
    //cart amount total function
    let totalAmont = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = service_list.find((product) => product._id === item);
        totalAmont += itemInfo.price * cartItems[item];
      }
    }
    return totalAmont;
  };

  const fetchServiceList = async () => {
    const response = await axios.get(url + "/api/service/list");
    setServiceList(response.data.data);
  };

  const loadCartData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadData() {
      await fetchServiceList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    service_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    clearCart,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
