import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
        <Toaster position="top-right" reverseOrder={false} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
