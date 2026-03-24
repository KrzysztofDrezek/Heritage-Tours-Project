import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function AdminLocationPicker({ selectedPosition, onSelectPosition }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onSelectPosition(lat, lng);
    },
  });

  return selectedPosition ? <Marker position={selectedPosition} /> : null;
}

function App() {
  const [tours, setTours] = useState([]);
  const [city, setCity] = useState("");
  const [theme, setTheme] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [message, setMessage] = useState("");

  const [selectedTourId, setSelectedTourId] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visitors, setVisitors] = useState(1);

  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  const [newTourTitle, setNewTourTitle] = useState("");
  const [newTourCity, setNewTourCity] = useState("");
  const [newTourTheme, setNewTourTheme] = useState("");
  const [newTourLatitude, setNewTourLatitude] = useState("");
  const [newTourLongitude, setNewTourLongitude] = useState("");
  const [newTourDescription, setNewTourDescription] = useState("");
  const [newTourDates, setNewTourDates] = useState("");
  const [newTourMaxPlaces, setNewTourMaxPlaces] = useState(10);

  async function loadAllTours() {
    try {
      const response = await fetch("/api/tours");
      const data = await response.json();
      setTours(data);
      setMessage("");
      setSelectedTourId(null);
      setAvailability([]);
      setSelectedDate("");
      setVisitors(1);
    } catch (error) {
      console.error("Error loading tours:", error);
      setMessage("Could not load tours.");
    }
  }

  async function searchTours(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        `/api/tours/search?city=${encodeURIComponent(city)}&theme=${encodeURIComponent(theme)}`
      );
      const data = await response.json();
      setTours(data);
      setMessage("");
      setSelectedTourId(null);
      setAvailability([]);
      setSelectedDate("");
      setVisitors(1);
    } catch (error) {
      console.error("Error searching tours:", error);
      setMessage("Search failed.");
    }
  }

  async function checkCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.username) {
          setCurrentUser(data);
        } else if (data.user && data.user.username) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error checking current user:", error);
      setCurrentUser(null);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Login successful.");
        setUsername("");
        setPassword("");
        setMyBookings([]);
        setBookingsLoaded(false);
        await checkCurrentUser();
      } else {
        setMessage(data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed.");
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(null);
        setMyBookings([]);
        setBookingsLoaded(false);
        setMessage(data.message || "Logged out.");
      } else {
        setMessage(data.error || "Logout failed.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Logout failed.");
    }
  }

  async function loadAvailability(tourId) {
    try {
      const response = await fetch(`/api/availability/tour/${tourId}`);
      const data = await response.json();

      setSelectedTourId(tourId);
      setAvailability(data);
      setSelectedDate("");
      setVisitors(1);
      setMessage("");
    } catch (error) {
      console.error("Error loading availability:", error);
      setMessage("Could not load availability.");
    }
  }

  async function handleBooking(e, tourIdOverride = null) {
    if (e) {
      e.preventDefault();
    }

    if (!currentUser) {
      setMessage("You must be logged in to make a booking.");
      return;
    }

    const tourIdToUse = tourIdOverride || selectedTourId;

    if (!tourIdToUse || !selectedDate || !visitors) {
      setMessage("Please select a date and number of visitors.");
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tourID: tourIdToUse,
          theDate: selectedDate,
          username: currentUser.username,
          visitors: Number(visitors),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Booking created successfully.");
        await loadAvailability(tourIdToUse);
        setSelectedDate("");
        setVisitors(1);

        if (currentUser?.username) {
          await loadMyBookings(currentUser.username);
        }
      } else {
        setMessage(data.error || "Booking failed.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("Booking failed.");
    }
  }

  async function loadMyBookings(usernameToUse = null) {
    const userToLoad = usernameToUse || currentUser?.username;

    if (!userToLoad) {
      setMessage("Please log in to view your bookings.");
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings/user/${encodeURIComponent(userToLoad)}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMyBookings(data);
        setBookingsLoaded(true);
        setMessage("");
      } else {
        setMessage(data.error || "Could not load bookings.");
      }
    } catch (error) {
      console.error("Error loading user bookings:", error);
      setMessage("Could not load bookings.");
    }
  }

  async function handleDeleteBooking(bookingId) {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Booking deleted successfully.");

        if (currentUser?.username) {
          await loadMyBookings(currentUser.username);
        }

        if (selectedTourId) {
          await loadAvailability(selectedTourId);
        }
      } else {
        setMessage(data.error || "Could not delete booking.");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setMessage("Could not delete booking.");
    }
  }

  async function handleAddTour(e) {
    e.preventDefault();

    const parsedDates = newTourDates
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item !== "");

    try {
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: newTourTitle,
          city: newTourCity,
          theme: newTourTheme,
          latitude: Number(newTourLatitude),
          longitude: Number(newTourLongitude),
          description: newTourDescription,
          dates: parsedDates,
          maxPlaces: Number(newTourMaxPlaces),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Tour created successfully.");
        setNewTourTitle("");
        setNewTourCity("");
        setNewTourTheme("");
        setNewTourLatitude("");
        setNewTourLongitude("");
        setNewTourDescription("");
        setNewTourDates("");
        setNewTourMaxPlaces(10);
        await loadAllTours();
      } else {
        setMessage(data.error || "Could not create tour.");
      }
    } catch (error) {
      console.error("Error creating tour:", error);
      setMessage("Could not create tour.");
    }
  }

  async function handleDeleteTour(tourId) {
    const confirmed = window.confirm("Are you sure you want to delete this tour?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Tour deleted successfully.");
        await loadAllTours();
      } else {
        setMessage(data.error || "Could not delete tour.");
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      setMessage("Could not delete tour.");
    }
  }

  function handleAdminMapSelect(lat, lng) {
    setNewTourLatitude(lat.toFixed(6));
    setNewTourLongitude(lng.toFixed(6));
  }

  const toursWithCoordinates = tours.filter(
    (tour) =>
      tour.latitude !== null &&
      tour.longitude !== null &&
      tour.latitude !== undefined &&
      tour.longitude !== undefined
  );

  const defaultMapCenter =
    toursWithCoordinates.length > 0
      ? [Number(toursWithCoordinates[0].latitude), Number(toursWithCoordinates[0].longitude)]
      : [53.8008, -1.5491];

  const adminSelectedPosition =
    newTourLatitude !== "" && newTourLongitude !== ""
      ? [Number(newTourLatitude), Number(newTourLongitude)]
      : null;

  useEffect(() => {
    loadAllTours();
    checkCurrentUser();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Heritage Tours</h1>

      <section style={{ marginBottom: "30px" }}>
        <h2>User Authentication</h2>

        {currentUser ? (
          <div>
            <p>
              Logged in as: <strong>{currentUser?.username || "Unknown user"}</strong>
              {currentUser?.role && ` (${currentUser.role})`}
            </p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        )}
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Search Tours</h2>
        <form onSubmit={searchTours} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
          <button type="submit">Search</button>
          <button
            type="button"
            onClick={() => {
              setCity("");
              setTheme("");
              setMessage("");
              loadAllTours();
            }}
          >
            Reset
          </button>
        </form>
      </section>

      {message && <p style={{ fontWeight: "bold" }}>{message}</p>}

      <section style={{ marginBottom: "30px" }}>
        <h2>Tour Map</h2>

        {toursWithCoordinates.length === 0 ? (
          <p>No map data available for current results.</p>
        ) : (
          <MapContainer
            center={defaultMapCenter}
            zoom={11}
            style={{ height: "450px", width: "100%", borderRadius: "8px" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {toursWithCoordinates.map((tour) => (
              <Marker
                key={tour.id}
                position={[Number(tour.latitude), Number(tour.longitude)]}
                eventHandlers={{
                  click: () => {
                    loadAvailability(tour.id);
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: "220px" }}>
                    <strong>{tour.title}</strong>
                    <br />
                    Theme: {tour.theme}
                    <br />
                    City: {tour.city}
                    <br />
                    <br />

                    {selectedTourId === tour.id ? (
                      <>
                        {availability.length === 0 ? (
                          <p>No available dates for this tour.</p>
                        ) : (
                          <>
                            <div style={{ marginBottom: "10px" }}>
                              <label>Select date: </label>
                              <br />
                              <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ width: "100%", marginTop: "5px" }}
                              >
                                <option value="">Choose a date</option>
                                {availability.map((item) => (
                                  <option key={item.id} value={item.theDate}>
                                    {item.theDate} ({item.maxPlaces} places left)
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ marginBottom: "10px" }}>
                              <label>Number of visitors: </label>
                              <br />
                              <input
                                type="number"
                                min="1"
                                value={visitors}
                                onChange={(e) => setVisitors(e.target.value)}
                                style={{ width: "100%", marginTop: "5px" }}
                              />
                            </div>

                            {currentUser ? (
                              <button
                                onClick={(e) => handleBooking(e, tour.id)}
                                style={{ width: "100%" }}
                              >
                                Book now
                              </button>
                            ) : (
                              <p>Please log in to make a booking.</p>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <p>Click the marker to load available dates.</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>My Bookings</h2>

        {currentUser ? (
          <>
            <button onClick={() => loadMyBookings()}>Load My Bookings</button>

            {bookingsLoaded && (
              <div style={{ marginTop: "15px" }}>
                {myBookings.length === 0 ? (
                  <p>No bookings found for this user.</p>
                ) : (
                  <ul>
                    {myBookings.map((booking) => (
                      <li key={booking.id} style={{ marginBottom: "15px" }}>
                        <strong>Booking ID:</strong> {booking.id}
                        <br />
                        <strong>Tour ID:</strong> {booking.tourID}
                        <br />
                        <strong>Date:</strong> {booking.theDate}
                        <br />
                        <strong>Username:</strong> {booking.username}
                        <br />
                        <strong>Visitors:</strong> {booking.visitors}
                        <br />
                        <button
                          style={{ marginTop: "8px" }}
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          <p>Please log in to view your bookings.</p>
        )}
      </section>

      {currentUser?.role === "admin" && (
        <section style={{ marginBottom: "30px" }}>
          <h2>Admin – Manage Tours</h2>

          <form onSubmit={handleAddTour} style={{ display: "grid", gap: "10px", maxWidth: "600px" }}>
            <input
              type="text"
              placeholder="Tour title"
              value={newTourTitle}
              onChange={(e) => setNewTourTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="City in the UK"
              value={newTourCity}
              onChange={(e) => setNewTourCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="Theme"
              value={newTourTheme}
              onChange={(e) => setNewTourTheme(e.target.value)}
            />

            <div>
              <p style={{ marginBottom: "8px" }}>
                Click on the map to select the tour location in the UK:
              </p>
              <MapContainer
                center={[54.5, -3]}
                zoom={5}
                style={{ height: "300px", width: "100%", borderRadius: "8px" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AdminLocationPicker
                  selectedPosition={adminSelectedPosition}
                  onSelectPosition={handleAdminMapSelect}
                />
              </MapContainer>
            </div>

            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={newTourLatitude}
              onChange={(e) => setNewTourLatitude(e.target.value)}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={newTourLongitude}
              onChange={(e) => setNewTourLongitude(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={newTourDescription}
              onChange={(e) => setNewTourDescription(e.target.value)}
            />
            <textarea
              placeholder="Dates in YYMMDD, separated by commas or new lines"
              value={newTourDates}
              onChange={(e) => setNewTourDates(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Max places for each date"
              value={newTourMaxPlaces}
              onChange={(e) => setNewTourMaxPlaces(e.target.value)}
            />
            <button type="submit">Add New Tour</button>
          </form>
        </section>
      )}

      <section>
        <h2>Available Tours</h2>

        {tours.length === 0 ? (
          <p>No tours found.</p>
        ) : (
          <ul>
            {tours.map((tour) => (
              <li key={tour.id} style={{ marginBottom: "20px" }}>
                <strong>{tour.title}</strong>
                <br />
                City: {tour.city}
                <br />
                Theme: {tour.theme}
                <br />
                Description: {tour.description}
                <br />
                <button
                  style={{ marginTop: "10px" }}
                  onClick={() => loadAvailability(tour.id)}
                >
                  Show dates
                </button>

                {currentUser?.role === "admin" && (
                  <button
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                    onClick={() => handleDeleteTour(tour.id)}
                  >
                    Delete Tour
                  </button>
                )}

                {selectedTourId === tour.id && (
                  <div style={{ marginTop: "15px", paddingLeft: "15px" }}>
                    <h3>Available Dates</h3>

                    {availability.length === 0 ? (
                      <p>No available dates for this tour.</p>
                    ) : (
                      <ul>
                        {availability.map((item) => (
                          <li key={item.id}>
                            Date: {item.theDate} | Places left: {item.maxPlaces}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;