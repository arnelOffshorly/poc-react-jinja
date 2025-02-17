import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { io } from 'socket.io-client';

const TemplatePreview = () => {
  const [socket, setSocket] = useState(null);
  const [props, setProps] = useState({
    title: '',
    description: '',
    features: [],
    showCTA: true,
    ctaText: ''
  });
  const [previewUrl, setPreviewUrl] = useState('http://localhost:5000');

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for prop updates
    newSocket.on('props_updated', (updatedProps) => {
      setProps(updatedProps);
    });

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  const handleChange = (name, value) => {
    const newProps = { ...props, [name]: value };
    setProps(newProps);
    saveProps(newProps);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...props.features];
    newFeatures[index] = value;
    const newProps = { ...props, features: newFeatures };
    setProps(newProps);
    saveProps(newProps);
  };

  const addFeature = () => {
    const newProps = {
      ...props,
      features: [...props.features, `Feature ${props.features.length + 1}`]
    };
    setProps(newProps);
    saveProps(newProps);
  };

  const removeFeature = (index) => {
    const newFeatures = props.features.filter((_, i) => i !== index);
    const newProps = { ...props, features: newFeatures };
    setProps(newProps);
    saveProps(newProps);
  };

  const saveProps = async (newProps) => {
    try {
      await fetch('http://localhost:5000/api/props', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProps),
      });
    } catch (error) {
      console.error('Error saving props:', error);
    }
  };

  return (
    <div className="p-4 flex gap-4">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Template Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={props.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={props.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Features</label>
              {props.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => removeFeature(index)}
                    className="px-2"
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button onClick={addFeature} className="mt-2">Add Feature</Button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show CTA</label>
              <Switch
                checked={props.showCTA}
                onCheckedChange={(checked) => handleChange('showCTA', checked)}
              />
            </div>

            {props.showCTA && (
              <div>
                <label className="block text-sm font-medium mb-1">CTA Text</label>
                <Input
                  value={props.ctaText}
                  onChange={(e) => handleChange('ctaText', e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            src={previewUrl}
            className="w-full h-96 border-0"
            title="Template Preview"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatePreview;