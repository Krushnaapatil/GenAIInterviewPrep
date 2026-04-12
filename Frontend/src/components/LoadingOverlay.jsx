import Spinner from './Spinner';
import './LoadingOverlay.scss';

const LoadingOverlay = ({ isLoading, message = 'Loading...' }) => {
    if (!isLoading) return null;

    return (
        <div className='loading-overlay'>
            <div className='loading-overlay__content'>
                <Spinner size='large' text={message} />
            </div>
        </div>
    );
};

export default LoadingOverlay;
