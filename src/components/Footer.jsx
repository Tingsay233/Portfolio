export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--navy-900)',
        color: 'var(--navy-300)',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--navy-800)',
      }}
    >
      <div className="container">
        ⚔ Hand-coded in Kuala Lumpur. No energy bars were harmed. © {new Date().getFullYear()} Say Si Ting.
      </div>
    </footer>
  );
}
