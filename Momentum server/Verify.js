// This is the code for your server. It runs on Vercel.
export default function handler(request, response) {
  // Get the license key sent from the After Effects script
  const { licenseKey } = request.body;

  // --- Your List of Valid License Keys ---
  // For now, we'll just keep a simple list here.
  // In the future, you could connect this to a database.
  const validKeys = [
    "TRIAL-USER-123",
    "RANA-ADMIN-KEY-001",
    "CUSTOMER-JOHN-DOE-PRO-LICENSE"
  ];

  // Check if the provided key is in our list
  if (validKeys.includes(licenseKey)) {
    // If it's valid, send back a success message
    response.status(200).json({
      isValid: true,
      message: "License is valid.",
    });
  } else {
    // If it's not valid, send back a failure message
    response.status(403).json({
      isValid: false,
      message: "Invalid or expired license key.",
    });
  }
}