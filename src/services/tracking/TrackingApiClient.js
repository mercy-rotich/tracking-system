import authService from '../authService.js';

export class TrackingApiClient {
  constructor(baseURL, endpointsRegistry) {
    this.baseURL = baseURL;
    this.endpointsRegistry = endpointsRegistry;
  }

  async getHeaders(isFormData = false) {
    try {
      const token = await authService.getValidToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      if (!isFormData) headers['Content-Type'] = 'application/json';
      return headers;
    } catch (error) {
      console.error('❌ [API Client] Failed to get valid token:', error);
      throw new Error('Authentication required. Please log in again.');
    }
  }

  async makeRequest(endpointName, options = {}) {
    const {
      pathParams = {},
      queryParams = {},
      body = null,
      skipTransform = false
    } = options;

    try {
      
      const endpoint = this.endpointsRegistry.getEndpoint(endpointName);
      
     
      const url = this.endpointsRegistry.buildUrl(this.baseURL, endpointName, pathParams, queryParams);
      console.log(`🔄 [API Client] ${endpoint.method} ${url}`);

      
      const requestOptions = {
        method: endpoint.method,
        headers: await this.getHeaders(body instanceof FormData)
      };

      if (body && endpoint.method !== 'GET') {
        requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

     
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${endpoint.method} ${endpointName} failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ [API Client] ${endpointName} successful:`, result);

      return {
        success: true,
        message: result.message || 'Request successful',
        data: result.data || result,
        raw: result,
        _requestInfo: {
          endpoint: endpointName,
          method: endpoint.method,
          url,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`❌ [API Client] ${endpointName} failed:`, error);
      throw new Error(`Failed to ${endpointName}: ${error.message}`);
    }
  }

  // Specialized methods for common patterns
  async get(endpointName, pathParams = {}, queryParams = {}) {
    return this.makeRequest(endpointName, { pathParams, queryParams });
  }

  async post(endpointName, body = null, pathParams = {}) {
    return this.makeRequest(endpointName, { pathParams, body });
  }

  async put(endpointName, body = null, pathParams = {}) {
    return this.makeRequest(endpointName, { pathParams, body });
  }

  async delete(endpointName, pathParams = {}) {
    return this.makeRequest(endpointName, { pathParams });
  }

  
  createFormData(data, allowedFields = []) {
    const formData = new FormData();
    
    const fieldsToProcess = allowedFields.length > 0 ? allowedFields : Object.keys(data);
    
    fieldsToProcess.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        if (field === 'documents' && Array.isArray(data[field])) {
          // Handle file uploads
          data[field].forEach((file, index) => {
            formData.append('documents', file);
          });
        } else {
          formData.append(field, String(data[field]));
        }
      }
    });
    
    return formData;
  }
}