import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import Homepage from "@/components/pages/Homepage"
import ProductDetail from "@/components/pages/ProductDetail"
import CategoryPage from "@/components/pages/CategoryPage"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-inter">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontFamily: 'Inter, sans-serif'
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App