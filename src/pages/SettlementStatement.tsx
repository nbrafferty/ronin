import { DocPage } from '../components/DocPage'
import { tokens as t } from '../lib/tokens'

const cellL: React.CSSProperties = { padding: '6px 0', borderBottom: '1px solid #f0f0f0' }
const cellR: React.CSSProperties = { padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }
const hdr: React.CSSProperties = { fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }

export default function SettlementStatement() {
  return (
    <DocPage>
      <div style={{ fontSize: 13, color: t.body, lineHeight: 1.45 }}>
        {/* Letterhead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #111111', paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.14em', color: t.heading }}>RONIN</div>
            <div style={{ width: 26, height: 3, background: t.red, margin: '4px 0' }} />
            <div style={{ fontSize: 8.5, letterSpacing: '.3em', color: '#8a8a8a', fontWeight: 600 }}>POINT OF SALE</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: t.heading }}>Merchandise Settlement Statement</div>
            <div style={{ fontSize: 12, color: t.secondary2, marginTop: 4 }}>Spring Music Fest 2026 · Statement no. SMF26-0516-BC</div>
          </div>
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', gap: 24, padding: '14px 0', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ flex: 1 }}>
            <div style={hdr}>VENDOR</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>Black Coyote</div>
            <div style={{ fontSize: 12, color: '#666666' }}>Dana Reyes · Tour Manager<br />Black Coyote LLC · Tax ID 32-0407341</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={hdr}>SHOW</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>Main Stage · 9:30 PM</div>
            <div style={{ fontSize: 12, color: '#666666' }}>Saturday, May 16, 2026<br />Attendance 25,000 · $0.49/head (vendor)</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={hdr}>DEAL TERMS · LOCKED AT ADVANCE</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>Vendor 80% / Venue 20%</div>
            <div style={{ fontSize: 12, color: '#666666' }}>Tax 10.25% inclusive, retained by venue<br />Credit card fee 5% · Concessionaire 5% off top</div>
          </div>
        </div>

        {/* Receipts + Show costs */}
        <div style={{ display: 'flex', gap: 24, padding: '14px 0 4px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.heading, marginBottom: 6 }}>Receipts</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '5px 0', ...hdr, borderBottom: '1px solid #dddddd' }}>PAYMENT FROM</th>
                  <th style={{ textAlign: 'right', padding: '5px 6px', ...hdr, borderBottom: '1px solid #dddddd' }}>RECEIPTS</th>
                  <th style={{ textAlign: 'right', padding: '5px 6px', ...hdr, borderBottom: '1px solid #dddddd' }}>FEE %</th>
                  <th style={{ textAlign: 'right', padding: '5px 0', ...hdr, borderBottom: '1px solid #dddddd' }}>FEE $</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cellL}>Credit card · Ronin POS</td><td style={cellR}>$11,300.00</td><td style={cellR}>5.00</td><td style={{ ...cellR, padding: '5px 0' }}>$565.00</td></tr>
                <tr><td style={cellL}>Cash · Ronin POS</td><td style={cellR}>$890.00</td><td style={cellR}>—</td><td style={{ ...cellR, padding: '5px 0' }}>—</td></tr>
                <tr><td style={{ padding: '5px 0', fontWeight: 700 }}>Total</td><td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700 }}>$12,190.00</td><td /><td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 700 }}>$565.00</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.heading, marginBottom: 6 }}>Show costs</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '5px 0', ...hdr, borderBottom: '1px solid #dddddd' }}>COST TYPE</th>
                  <th style={{ textAlign: 'left', padding: '5px 6px', ...hdr, borderBottom: '1px solid #dddddd' }}>APPLIED TO</th>
                  <th style={{ textAlign: 'right', padding: '5px 0', ...hdr, borderBottom: '1px solid #dddddd' }}>TOTAL COST</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cellL}>Concessionaire (5%)</td><td style={{ ...cellL, padding: '5px 6px', color: '#666666' }}>Off top</td><td style={{ ...cellR, padding: '5px 0' }}>$609.50</td></tr>
                <tr><td style={{ padding: '5px 0', fontWeight: 700 }}>Total</td><td /><td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 700 }}>$609.50</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales & deductions waterfall */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.heading, marginBottom: 6 }}>Sales &amp; deductions</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 0', ...hdr, borderBottom: '1px solid #dddddd' }}>LINE</th>
                {['APPAREL', 'MUSIC', 'OTHER', 'TOTAL'].map((h, i) => (
                  <th key={h} style={{ textAlign: 'right', padding: i === 3 ? '6px 0' : '6px 8px', ...hdr, borderBottom: '1px solid #dddddd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                ['Gross sales', '$11,920.00', '$0.00', '$270.00', '$12,190.00', 600],
                ['Sales tax (10.25%, inclusive)', '($1,108.01)', '$0.00', '($25.10)', '($1,133.11)', 0],
                ['Credit card fee (5%)', '($552.48)', '$0.00', '($12.52)', '($565.00)', 0],
                ['Concessionaire (off top)', '($596.00)', '$0.00', '($13.50)', '($609.50)', 0],
              ] as const).map(([line, ap, mu, ot, tot, weight]) => (
                <tr key={line}>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontWeight: weight ? 600 : undefined, color: weight ? undefined : t.secondary }}>{line}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f0f0f0', color: weight ? undefined : t.secondary }}>{ap}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f0f0f0', color: t.muted2 }}>{mu}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f0f0f0', color: weight ? undefined : t.secondary }}>{ot}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0', fontWeight: weight ? 700 : undefined, color: weight ? undefined : t.secondary }}>{tot}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '7px 0', fontWeight: 700, borderBottom: '2px solid #111111' }}>Adjusted gross</td>
                <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, borderBottom: '2px solid #111111' }}>$9,663.51</td>
                <td style={{ padding: '7px 8px', textAlign: 'right', color: t.muted2, borderBottom: '2px solid #111111' }}>$0.00</td>
                <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, borderBottom: '2px solid #111111' }}>$218.88</td>
                <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 700, borderBottom: '2px solid #111111' }}>$9,882.39</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Artist / Venue settlement */}
        <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.heading, marginBottom: 6 }}>Vendor settlement (80%)</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                <tr><td style={{ ...cellL, color: t.secondary }}>Apparel</td><td style={{ padding: '5px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>$7,730.81</td></tr>
                <tr><td style={{ ...cellL, color: t.secondary }}>Music</td><td style={{ padding: '5px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0', color: t.muted2 }}>$0.00</td></tr>
                <tr><td style={{ ...cellL, color: t.secondary }}>Other</td><td style={{ padding: '5px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>$175.10</td></tr>
                <tr><td style={{ padding: '6px 0', fontWeight: 700, color: t.red }}>Total due vendor</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 800, color: t.red }}>$7,905.91</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.heading, marginBottom: 6 }}>Venue settlement (20%)</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                <tr><td style={{ ...cellL, color: t.secondary }}>Apparel</td><td style={{ padding: '5px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>$1,932.70</td></tr>
                <tr><td style={{ ...cellL, color: t.secondary }}>Other</td><td style={{ padding: '5px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>$43.78</td></tr>
                <tr><td style={{ ...cellL, color: t.secondary }}>Tax retained</td><td style={{ padding: '5px 0', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>$1,133.11</td></tr>
                <tr><td style={{ padding: '6px 0', fontWeight: 700 }}>Total due venue</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 800 }}>$3,109.59</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Final payment box */}
        <div style={{ marginTop: 16, border: '1.5px solid #111111', borderRadius: 4, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            <b>Final payment.</b> Venue collected $12,190.00 via Ronin POS — venue owes vendor.
            <br />
            <span style={{ color: '#666666' }}>Paid via Stripe ACH to Black Coyote LLC ····6712 · lands next business day. No check to follow.</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={hdr}>PAID TO VENDOR</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.heading }}>$7,905.91</div>
          </div>
        </div>

        <p style={{ fontSize: 10, color: t.muted, lineHeight: 1.55, margin: '14px 0 18px' }}>
          In the absence of a formal invoice, this settlement statement shall serve as the record of monies due in connection with the gross sales of merchandise at the Venue. By signing below, the undersigned certify that they have reviewed the above-stated figures and, to the best of their knowledge, they are correct.
        </p>

        {/* Signatures */}
        <div style={{ display: 'flex', gap: 40, breakInside: 'avoid' }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 34, borderBottom: '1px solid #111111' }} />
            <div style={{ fontSize: 11, marginTop: 5 }}><b>Dana Reyes</b> · Tour Manager, Black Coyote<br /><span style={{ color: t.muted2 }}>Date</span></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 34, borderBottom: '1px solid #111111', display: 'flex', alignItems: 'flex-end', paddingBottom: 3, fontSize: 17, fontStyle: 'italic', fontFamily: "'Snell Roundhand','Brush Script MT',cursive", color: t.body2 }}>Alex Diaz</div>
            <div style={{ fontSize: 11, marginTop: 5 }}><b>Alex Diaz</b> · Merch Manager, Spring Music Fest<br /><span style={{ color: t.muted2 }}>May 16, 2026 · 11:58 PM</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: t.faint, borderTop: '1px solid #e0e0e0', marginTop: 20, paddingTop: 8 }}>
          <span>Settled by Alex Diaz · alex@roninpos.com</span>
          <span>Generated by Ronin POS Merchandise · May 16, 2026</span>
        </div>
      </div>
    </DocPage>
  )
}
