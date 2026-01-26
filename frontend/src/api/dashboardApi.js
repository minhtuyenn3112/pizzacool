const API_URL = import.meta.env.VITE_API_BASE;
const API_BASE_URL = `${API_URL}/admin`;

/**
 * Lấy thống kê dashboard (tổng user, sản phẩm, đơn hàng, doanh thu)
 * @returns {Promise<Object>} Object chứa stats: { totalUsers, totalProducts, totalOrders, revenue }
 */
export async function getDashboardStats() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Không thể lấy thống kê dashboard");
    }

    return res.json();
  } catch (err) {
    console.error("Lỗi getDashboardStats:", err);
    throw err;
  }
}

/**
 * Lấy danh sách hoạt động gần đây
 * @returns {Promise<Array>} Mảng các hoạt động admin
 */
export async function getActivities() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/activities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Không thể lấy danh sách hoạt động");
    }

    return res.json();
  } catch (err) {
    console.error("Lỗi getActivities:", err);
    throw err;
  }
}
