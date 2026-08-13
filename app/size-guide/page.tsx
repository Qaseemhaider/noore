import type { Metadata } from "next";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";
import styles from "@/components/content/support-page.module.css";
import { products } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Find the right size for NOORE abayas, hijabs, and chadars. Sizes are listed for every product currently in the collection.",
};

export default function SizeGuidePage() {
  const abayas = products.filter((product) => product.category === "Abayas");
  const scarves = products.filter(
    (product) => product.category === "Hijabs" || product.category === "Chadars",
  );

  return (
    <>
      <SupportPageHero
        eyebrow="Size guide"
        title="Size Guide"
        intro="Find the right fit for every piece in the collection. Sizes below come directly from each product listing."
      />
      <SupportSection
        eyebrow="The collection"
        title="Available sizes"
      >
        <p>
          Every product&apos;s available sizes are listed below and on its
          product page.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Available sizes</th>
                <th scope="col">Fabric</th>
              </tr>
            </thead>
            <tbody>
              {abayas.map((product) => (
                <tr key={product.id}>
                  <th scope="row">
                    <a href={`/product/${product.slug}`}>{product.name}</a>
                  </th>
                  <td>{product.category}</td>
                  <td>{product.sizes.join(", ")}</td>
                  <td>{product.fabric}</td>
                </tr>
              ))}
              {scarves.map((product) => (
                <tr key={product.id}>
                  <th scope="row">
                    <a href={`/product/${product.slug}`}>{product.name}</a>
                  </th>
                  <td>{product.category}</td>
                  <td>{product.sizes.join(", ")}</td>
                  <td>{product.fabric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small>
          Sizes reflect the products currently in the collection and will be
          kept in step with the shop as new pieces are added.
        </small>
      </SupportSection>
      <SupportSection eyebrow="Abayas" title="Choosing an abaya size">
        <p>
          <strong>General sizing guidance only:</strong> abayas are currently
          available in S, M, L, and XL. As a starting point, most customers
          choose the size they usually wear in modest-wear clothing.
        </p>
        <ul>
          <li>If you are between sizes, the fit you prefer is the better guide — a closer fit or a more relaxed drape.</li>
          <li>Different styles may fit differently, even in the same size.</li>
          <li>Abayas are designed with generous, flowing silhouettes, so sizes can be forgiving.</li>
        </ul>
        <p>
          Detailed garment measurements are not published yet. They will be
          added to this page before launch.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Hijabs & chadars" title="One-size pieces">
        <p>
          Our hijabs and chadars are <strong>One Size</strong> and designed to
          drape comfortably for most wearers.
        </p>
      </SupportSection>
    </>
  );
}
