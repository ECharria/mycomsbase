"""
Join mycomsbase_unique_compounds.csv + taxonomy_info.csv and produce
taxonomy_tree.json — a nested hierarchy with biosynthetic class counts
at every node (phylum → class → order → family → genus → species).
"""

import csv
import json
from collections import defaultdict

RANKS = ["phylum", "class", "order", "family", "genus", "species"]


def load_data():
    tax = {}
    with open("taxonomy_info.csv") as f:
        for row in csv.DictReader(f):
            tax[row["species"]] = row

    compounds = []
    with open("mycomsbase_unique_compounds.csv") as f:
        for row in csv.DictReader(f):
            if row["fungal_producer"] not in ("NA", ""):
                compounds.append(row)

    return tax, compounds


def make_node(name, rank):
    return {"name": name, "rank": rank, "class_counts": defaultdict(int), "children": {}}


def build_tree(tax, compounds):
    root = make_node("Fungi", "kingdom")

    for row in compounds:
        sp = row["fungal_producer"]
        cls = row["compound_class"]
        n = int(row["n_spectra"])
        t = tax.get(sp, {})

        path = [
            ("phylum", t.get("phylum", "Unknown")),
            ("class",  t.get("class",  "Unknown")),
            ("order",  t.get("order",  "Unknown")),
            ("family", t.get("family", "Unknown")),
            ("genus",  t.get("genus",  sp.split()[0])),
            ("species", sp),
        ]

        node = root
        node["class_counts"][cls] += n
        for rank, name in path:
            if name not in node["children"]:
                node["children"][name] = make_node(name, rank)
            node = node["children"][name]
            node["class_counts"][cls] += n

    return root


def serialise(node):
    return {
        "name": node["name"],
        "rank": node["rank"],
        "class_counts": dict(node["class_counts"]),
        "children": [serialise(c) for c in node["children"].values()],
    }


def main():
    tax, compounds = load_data()
    tree = build_tree(tax, compounds)
    out = serialise(tree)

    import os
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_path = os.path.join(base, "web-frontend/src/assets/taxonomy_tree.json")
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Written to {out_path}")
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
