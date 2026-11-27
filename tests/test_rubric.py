import json
from pathlib import Path


def test_rubric_schema_and_weights():
    rubric_path = Path(__file__).parent.parent / "src" / "config" / "rubric.json"
    assert rubric_path.exists(), "rubric.json must exist in src/config/"
    data = json.loads(rubric_path.read_text(encoding="utf-8"))

    assert "minPassScore" in data
    assert data["minPassScore"] >= 50
    assert "checks" in data
    assert len(data["checks"]) >= 3

    total_weight = sum(c["weight"] for c in data["checks"])
    assert total_weight == 100, f"Expected total weight 100, got {total_weight}"

    for c in data["checks"]:
        assert "id" in c
        assert "mechanical" in c
        assert "weight" in c
