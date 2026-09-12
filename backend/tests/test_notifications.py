"""
Test Suite: Notifications & Activity Alerts
===========================================
Verifies:
1. Submitting an offer creates a notification for the listing's farmer.
2. Accepting an offer creates a notification for the buyer.
3. GET /api/notifications returns only the logged-in user's own notifications, not other users'.
4. GET /api/notifications/unread-count returns the correct count.
5. PATCH /api/notifications/{id}/read marks it read; a second call to unread-count reflects the change.
6. Attempting to mark another user's notification as read returns 404.
7. Rejecting an offer creates a notification for the buyer.
8. Advancing transaction stages creates a notification for the other party.
9. GET /api/notifications?unread_only=true filters correctly.
10. PATCH /api/notifications/read-all marks all unread notifications as read.
"""

import itertools
import pytest

_phone_seq = itertools.count(7800001000)


def get_auth_token(client, phone: str, role: str, name: str = None) -> tuple[str, int]:
    """Helper to register or login a user and return (jwt_token, user_id)."""
    user_name = name or f"User {phone}"
    res = client.post("/api/auth/signup", json={
        "phone": phone,
        "password": "Password123!",
        "role": role,
        "name": user_name
    })
    if res.status_code == 409:
        res = client.post("/api/auth/login", json={
            "phone": phone,
            "password": "Password123!",
            "role": role,
        })
    data = res.json()
    return data["access_token"], data["user"]["id"]


def test_1_submitting_offer_creates_notification_for_farmer(client):
    """1. Submitting an offer creates a notification for the listing's farmer."""
    farmer_phone = str(next(_phone_seq))
    buyer_phone = str(next(_phone_seq))

    farmer_token, farmer_id = get_auth_token(client, farmer_phone, "farmer", name="Ramesh Kisan")
    buyer_token, buyer_id = get_auth_token(client, buyer_phone, "buyer", name="Agro Traders")

    # Farmer creates a listing
    res_listing = client.post(
        "/api/listings",
        json={
            "crop": "cotton",
            "quantity": 25.0,
            "unit": "quintal",
            "asking_price": 6200.0
        },
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_listing.status_code == 201
    listing_id = res_listing.json()["id"]

    # Initial unread count for farmer should be 0
    res_count_0 = client.get(
        "/api/notifications/unread-count",
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_count_0.status_code == 200
    assert res_count_0.json()["count"] == 0

    # Buyer submits an offer
    res_offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 5900.0,
            "made_by": "buyer"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res_offer.status_code == 201
    offer_id = res_offer.json()["id"]

    # Farmer should now have 1 notification
    res_notifs = client.get(
        "/api/notifications",
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_notifs.status_code == 200
    notifs = res_notifs.json()["notifications"]
    assert len(notifs) >= 1

    latest = notifs[0]
    assert latest["notification_type"] == "new_offer"
    assert latest["related_id"] == offer_id
    assert latest["is_read"] is False
    assert "Agro Traders" in latest["message"]
    assert "5900" in latest["message"]
    assert "cotton" in latest["message"]


def test_2_accepting_offer_creates_notification_for_buyer(client):
    """2. Accepting an offer creates a notification for the buyer."""
    farmer_phone = str(next(_phone_seq))
    buyer_phone = str(next(_phone_seq))

    farmer_token, farmer_id = get_auth_token(client, farmer_phone, "farmer")
    buyer_token, buyer_id = get_auth_token(client, buyer_phone, "buyer")

    # Create listing & offer
    res_listing = client.post(
        "/api/listings",
        json={
            "crop": "wheat",
            "quantity": 50.0,
            "unit": "quintal",
            "asking_price": 2400.0
        },
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = res_listing.json()["id"]

    res_offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 2350.0,
            "made_by": "buyer"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    offer_id = res_offer.json()["id"]

    # Farmer accepts the offer
    res_accept = client.patch(
        f"/api/listings/{listing_id}/offers/{offer_id}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_accept.status_code == 200

    # Buyer should receive an alert
    res_buyer_notifs = client.get(
        "/api/notifications",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res_buyer_notifs.status_code == 200
    buyer_notifs = res_buyer_notifs.json()["notifications"]
    assert len(buyer_notifs) >= 1

    latest = buyer_notifs[0]
    assert latest["notification_type"] == "offer_response"
    assert latest["related_id"] == offer_id
    assert latest["is_read"] is False
    assert "Your offer for wheat was accepted." in latest["message"]


def test_3_notifications_returns_only_own_notifications(client):
    """3. GET /api/notifications returns only the logged-in user's own notifications, not other users'."""
    user1_phone = str(next(_phone_seq))
    user2_phone = str(next(_phone_seq))

    token1, id1 = get_auth_token(client, user1_phone, "farmer")
    token2, id2 = get_auth_token(client, user2_phone, "farmer")
    buyer_token, buyer_id = get_auth_token(client, str(next(_phone_seq)), "buyer")

    # User 1 listing + offer
    res1 = client.post(
        "/api/listings",
        json={"crop": "soybean", "quantity": 10.0, "unit": "quintal", "asking_price": 4500.0},
        headers={"Authorization": f"Bearer {token1}"}
    )
    client.post(
        f"/api/listings/{res1.json()['id']}/offers",
        json={"amount": 4400.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    # User 1 has a notification
    res_user1 = client.get("/api/notifications", headers={"Authorization": f"Bearer {token1}"})
    assert len(res_user1.json()["notifications"]) == 1

    # User 2 has NO notifications
    res_user2 = client.get("/api/notifications", headers={"Authorization": f"Bearer {token2}"})
    assert len(res_user2.json()["notifications"]) == 0


def test_4_unread_count_returns_correct_count(client):
    """4. GET /api/notifications/unread-count returns the correct count."""
    farmer_phone = str(next(_phone_seq))
    farmer_token, _ = get_auth_token(client, farmer_phone, "farmer")
    buyer1_token, _ = get_auth_token(client, str(next(_phone_seq)), "buyer")
    buyer2_token, _ = get_auth_token(client, str(next(_phone_seq)), "buyer")

    # Listing by farmer
    res_listing = client.post(
        "/api/listings",
        json={"crop": "mustard", "quantity": 15.0, "unit": "quintal", "asking_price": 5200.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = res_listing.json()["id"]

    # Initial count = 0
    c0 = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {farmer_token}"}).json()["count"]
    assert c0 == 0

    # Offer 1
    client.post(f"/api/listings/{listing_id}/offers", json={"amount": 5000.0, "made_by": "buyer"}, headers={"Authorization": f"Bearer {buyer1_token}"})
    c1 = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {farmer_token}"}).json()["count"]
    assert c1 == 1

    # Offer 2
    client.post(f"/api/listings/{listing_id}/offers", json={"amount": 5100.0, "made_by": "buyer"}, headers={"Authorization": f"Bearer {buyer2_token}"})
    c2 = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {farmer_token}"}).json()["count"]
    assert c2 == 2


def test_5_patch_notification_read_marks_read_and_updates_unread_count(client):
    """5. PATCH /api/notifications/{id}/read marks it read; a second call to unread-count reflects the change."""
    farmer_phone = str(next(_phone_seq))
    farmer_token, _ = get_auth_token(client, farmer_phone, "farmer")
    buyer_token, _ = get_auth_token(client, str(next(_phone_seq)), "buyer")

    # Listing and offer
    res_listing = client.post(
        "/api/listings",
        json={"crop": "maize", "quantity": 40.0, "unit": "quintal", "asking_price": 1900.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = res_listing.json()["id"]

    client.post(
        f"/api/listings/{listing_id}/offers",
        json={"amount": 1850.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {farmer_token}"}).json()["notifications"]
    assert len(notifs) == 1
    notif_id = notifs[0]["id"]
    assert notifs[0]["is_read"] is False

    # Mark as read
    res_patch = client.patch(
        f"/api/notifications/{notif_id}/read",
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["is_read"] is True

    # Check unread count drops to 0
    c_after = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {farmer_token}"}).json()["count"]
    assert c_after == 0


def test_6_mark_other_user_notification_returns_404(client):
    """6. Attempting to mark another user's notification as read returns 404."""
    user1_phone = str(next(_phone_seq))
    user2_phone = str(next(_phone_seq))
    token1, _ = get_auth_token(client, user1_phone, "farmer")
    token2, _ = get_auth_token(client, user2_phone, "farmer")
    buyer_token, _ = get_auth_token(client, str(next(_phone_seq)), "buyer")

    # Listing by user 1
    res_listing = client.post(
        "/api/listings",
        json={"crop": "barley", "quantity": 20.0, "unit": "quintal", "asking_price": 1800.0},
        headers={"Authorization": f"Bearer {token1}"}
    )
    client.post(
        f"/api/listings/{res_listing.json()['id']}/offers",
        json={"amount": 1750.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    notif_id = client.get("/api/notifications", headers={"Authorization": f"Bearer {token1}"}).json()["notifications"][0]["id"]

    # User 2 tries to mark User 1's notification as read -> 404 Not Found
    res_unauth = client.patch(
        f"/api/notifications/{notif_id}/read",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res_unauth.status_code == 404
    assert "not found" in res_unauth.json()["detail"].lower()


def test_7_rejecting_offer_creates_notification_for_buyer(client):
    """7. Rejecting an offer creates a notification for the buyer."""
    farmer_phone = str(next(_phone_seq))
    buyer_phone = str(next(_phone_seq))
    farmer_token, _ = get_auth_token(client, farmer_phone, "farmer")
    buyer_token, _ = get_auth_token(client, buyer_phone, "buyer")

    res_listing = client.post(
        "/api/listings",
        json={"crop": "chana", "quantity": 12.0, "unit": "quintal", "asking_price": 5400.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = res_listing.json()["id"]

    res_offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={"amount": 4200.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    offer_id = res_offer.json()["id"]

    # Farmer rejects offer
    res_reject = client.patch(
        f"/api/listings/{listing_id}/offers/{offer_id}",
        json={"action": "reject"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_reject.status_code == 200

    # Buyer gets notification
    buyer_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {buyer_token}"}).json()["notifications"]
    assert len(buyer_notifs) >= 1
    assert "Your offer for chana was rejected." in buyer_notifs[0]["message"]
    assert buyer_notifs[0]["notification_type"] == "offer_response"


def test_8_transaction_stage_advance_creates_notification_for_other_party(client):
    """8. Transaction stage advance (confirm_pickup, confirm_payment) creates notification for the other party."""
    farmer_phone = str(next(_phone_seq))
    buyer_phone = str(next(_phone_seq))
    farmer_token, _ = get_auth_token(client, farmer_phone, "farmer")
    buyer_token, _ = get_auth_token(client, buyer_phone, "buyer")

    # Listing & accepted offer
    res_listing = client.post(
        "/api/listings",
        json={"crop": "turmeric", "quantity": 8.0, "unit": "quintal", "asking_price": 12000.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = res_listing.json()["id"]

    res_offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={"amount": 11800.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    offer_id = res_offer.json()["id"]

    client.patch(
        f"/api/listings/{listing_id}/offers/{offer_id}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )

    # Buyer has 1 notification (offer accepted)
    initial_buyer_count = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {buyer_token}"}).json()["count"]
    assert initial_buyer_count == 1

    # Farmer advances stage to confirm_pickup
    res_pickup = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_pickup"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_pickup.status_code == 200

    # Buyer gets transaction_update notification
    buyer_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {buyer_token}"}).json()["notifications"]
    latest = buyer_notifs[0]
    assert latest["notification_type"] == "transaction_update"
    assert "Turmeric status updated: Pickup Confirmed." in latest["message"]


def test_9_unread_only_filter_and_read_all(client):
    """9. Test unread_only filter and read-all endpoint."""
    farmer_phone = str(next(_phone_seq))
    farmer_token, _ = get_auth_token(client, farmer_phone, "farmer")
    buyer_token, _ = get_auth_token(client, str(next(_phone_seq)), "buyer")

    res_listing = client.post(
        "/api/listings",
        json={"crop": "onion", "quantity": 100.0, "unit": "quintal", "asking_price": 1600.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = res_listing.json()["id"]

    # Generate 2 offers -> 2 unread notifications for farmer
    client.post(f"/api/listings/{listing_id}/offers", json={"amount": 1500.0, "made_by": "buyer"}, headers={"Authorization": f"Bearer {buyer_token}"})
    client.post(f"/api/listings/{listing_id}/offers", json={"amount": 1520.0, "made_by": "buyer"}, headers={"Authorization": f"Bearer {buyer_token}"})

    all_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {farmer_token}"}).json()["notifications"]
    assert len(all_notifs) == 2

    # Mark first one as read
    client.patch(f"/api/notifications/{all_notifs[0]['id']}/read", headers={"Authorization": f"Bearer {farmer_token}"})

    # Test ?unread_only=true
    unread_res = client.get("/api/notifications?unread_only=true", headers={"Authorization": f"Bearer {farmer_token}"}).json()["notifications"]
    assert len(unread_res) == 1
    assert unread_res[0]["id"] == all_notifs[1]["id"]

    # Test read-all
    res_read_all = client.patch("/api/notifications/read-all", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_read_all.status_code == 200
    assert res_read_all.json()["marked_read"] == 1

    # Unread count is now 0
    final_count = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {farmer_token}"}).json()["count"]
    assert final_count == 0
