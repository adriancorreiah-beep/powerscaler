from powerscaler.analyzer import analyze_payload


def test_analyze_payload_core_structure():
    payload = {
        "character": "Test Hero",
        "evidence": [
            {"id": "E1", "text": "Can destroy a mountain with one blast.", "source": "ch1", "reliability": 0.9},
            {"id": "E2", "text": "Dodges light-speed attacks consistently.", "source": "ch2", "reliability": 0.8},
        ],
    }

    result = analyze_payload(payload)

    assert result["character"] == "Test Hero"
    assert "Attack Potency" in result["categories"]
    assert "Speed" in result["categories"]
    assert result["categories"]["Attack Potency"]["score"] >= 1
    assert isinstance(result["reasoning_chain"], list)
    assert "consistency_check" in result


def test_missing_information_is_reported():
    payload = {"character": "Sparse", "evidence": []}
    result = analyze_payload(payload)

    assert result["consistency_check"]["missing_information"]
