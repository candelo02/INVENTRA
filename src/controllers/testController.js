export const getProfile = (req, res) => {
  res.json({
    message: "Ruta protegida funcionando",
    user: req.user
  });
};