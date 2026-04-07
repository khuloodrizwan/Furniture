import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = "http://localhost:4000"
    const [fur_list, setFurList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("")
    const currency = "₹";
    const deliveryCharge = 2;

    // cartItems shape: { itemId: { quantity: 1, months: 1 } }

    const addToCart = async (itemId, months = 1) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: {
                quantity: 1,
                months: prev[itemId]?.months || months
            }
        }));
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            delete updated[itemId];
            return updated;
        });
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    }

    const updateCartMonths = (itemId, months) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], months }
        }));
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
                if (cartItems[item]?.quantity > 0) {
                    let itemInfo = fur_list.find((product) => product._id === item);
                    const months = cartItems[item]?.months || 1;
                    totalAmount += itemInfo.price;
                }
            } catch (error) {}
        }
        return totalAmount;
    }

    const fetchFurList = async () => {
        const response = await axios.get(url + "/api/fur/list");
        setFurList(response.data.data);
    }

    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: token });
        // convert old format if needed
        const raw = response.data.cartData || {};
        const converted = {};
        for (const key in raw) {
            if (typeof raw[key] === 'number') {
                converted[key] = { quantity: 1, months: raw[key] };
            } else {
                converted[key] = raw[key];
            }
        }
        setCartItems(converted);
    }

    useEffect(() => {
        async function loadData() {
            await fetchFurList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"))
                await loadCartData({ token: localStorage.getItem("token") })
            }
        }
        loadData()
    }, [])

    const contextValue = {
        url, fur_list, menu_list, cartItems, addToCart,
        removeFromCart, getTotalCartAmount, token, setToken,
        loadCartData, setCartItems, currency, deliveryCharge,
        updateCartMonths
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;