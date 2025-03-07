import { createContext, useState } from "react";

const UserType = createContext();

const UserContext = ({ children }) => {
    const [userId, setUserId] = useState("");
    const [checkCart, setCheckCart] = useState(true);
    const [token, setToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");

    return (
        <UserType.Provider value={{ userId, setUserId, token, setToken, refreshToken, setRefreshToken, checkCart, setCheckCart }}>
            {children}
        </UserType.Provider>
    );
};

export { UserType, UserContext };
