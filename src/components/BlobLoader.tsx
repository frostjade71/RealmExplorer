export function BlobLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.5 : size === 'lg' ? 1.5 : 1;
  
  return (
    <div className="flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
      <StyledSpinner />
    </div>
  );
}

function StyledSpinner() {
  return (
    <>
      <style>{`
        .spinner-wrapper {
          --size: 30px;
          --first-block-clr: #1A3D1A; /* realm-dark */
          --second-block-clr: #2B6B2B; /* realm-shadow */
          width: 100px;
          height: 100px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-wrapper::after,
        .spinner-wrapper::before {
          box-sizing: border-box;
          position: absolute;
          content: "";
          width: var(--size);
          height: var(--size);
          top: 50%;
          left: 50%;
          background: var(--first-block-clr);
          animation: up 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
        }

        .spinner-wrapper::after {
          background: var(--second-block-clr);
          top: calc(50% - var(--size));
          left: calc(50% - var(--size));
          animation: down 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
        }

        @keyframes down {
          0%, 100% {
            transform: none;
          }
          25% {
            transform: translateX(100%);
          }
          50% {
            transform: translateX(100%) translateY(100%);
          }
          75% {
            transform: translateY(100%);
          }
        }

        @keyframes up {
          0%, 100% {
            transform: none;
          }
          25% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-100%) translateY(-100%);
          }
          75% {
            transform: translateY(-100%);
          }
        }
      `}</style>
      <div className="spinner-wrapper" />
    </>
  );
}
