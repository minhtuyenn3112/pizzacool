import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

// User rating
const DANH_GIA_API = `${API_BASE_URL}/danhgia`;

// Admin rating
const ADMIN_DANH_GIA_API = `${API_BASE_URL}/admin/danhgia`;

export async function createDanhGia(
  { sanPham, nguoiDung, diemDanhGia, nhanXet },
  token,
) {
  const res = await axios.post(
    DANH_GIA_API,
    { sanPham, nguoiDung, diemDanhGia, nhanXet },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return res.data;
}

export async function getDanhGiaByProduct(productId) {
  const res = await axios.get(`${DANH_GIA_API}/sanpham/${productId}`);
  return res.data;
}

export async function getDanhGiaByUser(userId, token) {
  const res = await axios.get(`${DANH_GIA_API}/nguoidung/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

// Admin reply to a rating
export async function adminReplyRating(ratingId, phanHoi, token) {
  if (!token) throw new Error("Missing token for admin action");

  const res = await axios.put(
    `${ADMIN_DANH_GIA_API}/${ratingId}/phanhoi`,
    { phanHoi },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
